import { formatCompactCurrency } from "@/lib/format";
import type {
  DemoAlert,
  DemoClientRecord,
  DemoOpportunity,
  IntelligenceCard,
  SuitabilityCheck,
} from "@/lib/demo/types";

/** Drift beyond this many percentage points is treated as a mandate breach. */
export const RISK_BREACH_THRESHOLD_PCT = 8;
/** Cash above target by this much is treated as a drag worth acting on. */
export const IDLE_CASH_THRESHOLD_PCT = 3;
/** No meaningful contact for this long marks a relationship as at risk. */
export const DORMANT_DAYS = 120;
/** Maturities inside this window appear as attention items. */
export const MATURITY_WINDOW_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

function daysUntil(iso: string): number {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.round((time - Date.now()) / DAY_MS);
}

function clientName(record: DemoClientRecord): string {
  return `${record.client.firstName} ${record.client.lastName}`;
}

export function cashBalance(record: DemoClientRecord): number {
  return record.detail.accounts.reduce(
    (total, account) => total + account.balance,
    0,
  );
}

export function excessCash(record: DemoClientRecord): number {
  const managedBook =
    record.client.aum > 0
      ? record.client.aum
      : record.client.aua + record.client.aum;
  const target = (managedBook * record.targetCashPct) / 100;
  return Math.max(0, Math.round(cashBalance(record) - target));
}

export function holdingsValue(record: DemoClientRecord): number {
  return record.detail.holdings.reduce(
    (total, holding) => total + (holding.current_value ?? 0),
    0,
  );
}

export function propertyValue(record: DemoClientRecord): number {
  return record.detail.propertyAssets.reduce(
    (total, property) => total + (property.current_value ?? 0),
    0,
  );
}

export type GoalGap = {
  title: string;
  fundedPct: number;
  shortfall: number;
  yearsRemaining: number;
};

/** The most pressing underfunded goal — nearest deadline, weakest funding. */
export function worstGoalGap(record: DemoClientRecord): GoalGap | null {
  const gaps = record.detail.goals
    .filter((goal) => (goal.target ?? 0) > 0)
    .map((goal) => {
      const target = goal.target ?? 0;
      return {
        title: goal.title,
        fundedPct: Math.round((goal.current / target) * 100),
        shortfall: Math.max(0, Math.round(target - goal.current)),
        yearsRemaining: goal.yearsRemaining ?? 99,
      };
    })
    .filter((gap) => gap.fundedPct < 85 && gap.yearsRemaining <= 5);

  if (gaps.length === 0) {
    return null;
  }

  return gaps.sort(
    (a, b) =>
      a.yearsRemaining - b.yearsRemaining || a.fundedPct - b.fundedPct,
  )[0];
}

export function largestConcentration(
  record: DemoClientRecord,
): { name: string; pct: number } | null {
  const total = holdingsValue(record);
  if (total <= 0) {
    return null;
  }

  const sorted = [...record.detail.holdings].sort(
    (a, b) => (b.current_value ?? 0) - (a.current_value ?? 0),
  );
  const top = sorted[0];

  if (!top) {
    return null;
  }

  return {
    name: top.name,
    pct: Math.round(((top.current_value ?? 0) / total) * 1000) / 10,
  };
}

/**
 * Rule-derived attention items. Computed on read so they stay accurate as
 * dates move, rather than going stale in the store.
 */
export function deriveAlerts(records: DemoClientRecord[]): DemoAlert[] {
  const alerts: DemoAlert[] = [];

  for (const record of records) {
    const { client } = record;
    const name = clientName(record);
    const base = {
      clientId: client.id,
      clientName: name,
      advisorId: client.advisorId,
      read: false,
    };

    if (record.portfolioDriftPct >= RISK_BREACH_THRESHOLD_PCT) {
      alerts.push({
        ...base,
        id: `derived-risk-${client.id}`,
        kind: "risk_breach",
        severity: "critical",
        title: "Risk band breach",
        detail: `Allocation sits ${record.portfolioDriftPct.toFixed(1)} points outside the agreed ${client.riskLevel} band.`,
        workspaceTab: "assets",
        createdAt: client.lastContactAt,
      });
    }

    const reviewDays = daysUntil(client.nextReviewAt);
    if (reviewDays < 0) {
      alerts.push({
        ...base,
        id: `derived-review-${client.id}`,
        kind: "review_overdue",
        severity: "warning",
        title: "Review overdue",
        detail: `Annual review is ${Math.abs(reviewDays)} days past due.`,
        workspaceTab: "overview",
        createdAt: client.nextReviewAt,
      });
    }

    if (record.idleCashPct > record.targetCashPct + IDLE_CASH_THRESHOLD_PCT) {
      alerts.push({
        ...base,
        id: `derived-cash-${client.id}`,
        kind: "idle_cash",
        severity: "warning",
        title: "Idle cash above mandate",
        detail: `${record.idleCashPct.toFixed(1)}% in cash against a ${record.targetCashPct}% target — ${formatCompactCurrency(excessCash(record))} deployable.`,
        workspaceTab: "assets",
        createdAt: client.lastContactAt,
      });
    }

    const gap = worstGoalGap(record);
    if (gap) {
      alerts.push({
        ...base,
        id: `derived-goal-${client.id}`,
        kind: "goal_gap",
        severity: "warning",
        title: "Goal funding behind plan",
        detail: `${gap.title} is ${gap.fundedPct}% funded with ${gap.yearsRemaining} year${gap.yearsRemaining === 1 ? "" : "s"} remaining.`,
        workspaceTab: "goals",
        createdAt: client.lastContactAt,
      });
    }

    if (record.maturingInvestment) {
      const maturityDays = daysUntil(record.maturingInvestment.maturesAt);
      if (maturityDays <= MATURITY_WINDOW_DAYS) {
        alerts.push({
          ...base,
          id: `derived-maturity-${client.id}`,
          kind: "maturity",
          severity: maturityDays <= 7 ? "warning" : "info",
          title: "Investment maturing",
          detail: `${record.maturingInvestment.name} (${formatCompactCurrency(record.maturingInvestment.valueUsd)}) matures in ${maturityDays} day${maturityDays === 1 ? "" : "s"}.`,
          workspaceTab: "assets",
          createdAt: client.lastContactAt,
        });
      }
    }

    if (record.lastEngagementDays > DORMANT_DAYS) {
      alerts.push({
        ...base,
        id: `derived-dormant-${client.id}`,
        kind: "escalation",
        severity: "warning",
        title: "Relationship at risk",
        detail: `No meaningful contact for ${record.lastEngagementDays} days. Attrition risk is elevated.`,
        workspaceTab: "overview",
        createdAt: client.lastContactAt,
      });
    }
  }

  return alerts;
}

export function deriveOpportunities(
  records: DemoClientRecord[],
): DemoOpportunity[] {
  const opportunities: DemoOpportunity[] = [];

  for (const record of records) {
    const { client } = record;
    const name = clientName(record);
    const base = {
      clientId: client.id,
      clientName: name,
      advisorId: client.advisorId,
    };

    const deployable = excessCash(record);
    if (deployable >= 250_000) {
      opportunities.push({
        ...base,
        id: `opp-cash-${client.id}`,
        kind: "cash_deployment",
        valueUsd: deployable,
        rationale: `${record.idleCashPct.toFixed(1)}% cash weighting against a ${record.targetCashPct}% target.`,
        suggestedProductIds: ["prd-treasury-plus", "prd-ig-credit"],
      });
    }

    if (record.portfolioDriftPct >= 5) {
      opportunities.push({
        ...base,
        id: `opp-rebalance-${client.id}`,
        kind: "rebalancing",
        valueUsd: Math.round(
          (client.aua * record.portfolioDriftPct) / 100,
        ),
        rationale: `Allocation has drifted ${record.portfolioDriftPct.toFixed(1)} points from the model.`,
        suggestedProductIds: ["prd-sovereign-ladder", "prd-ig-credit"],
      });
    }

    const property = propertyValue(record);
    if (property >= 1_500_000 || holdingsValue(record) >= 15_000_000) {
      opportunities.push({
        ...base,
        id: `opp-lending-${client.id}`,
        kind: "lending",
        valueUsd: Math.round(holdingsValue(record) * 0.5),
        rationale:
          "Eligible marketable collateral supports a Lombard facility without crystallising gains.",
        suggestedProductIds: ["prd-lombard"],
      });
    }

    if (record.heldAwayUsd >= 500_000) {
      opportunities.push({
        ...base,
        id: `opp-heldaway-${client.id}`,
        kind: "held_away",
        valueUsd: record.heldAwayUsd,
        rationale: `${formatCompactCurrency(record.heldAwayUsd)} of assets sit outside the bank.`,
        suggestedProductIds: ["prd-global-equity-core"],
      });
    }

    if (record.maturingInvestment) {
      opportunities.push({
        ...base,
        id: `opp-maturing-${client.id}`,
        kind: "maturing",
        valueUsd: record.maturingInvestment.valueUsd,
        rationale: `${record.maturingInvestment.name} matures shortly and needs a reinvestment decision.`,
        suggestedProductIds: ["prd-ig-credit", "prd-term-deposit"],
      });
    }

    if (
      (record.segment === "uhnw" || record.segment === "hnw") &&
      record.detail.insurancePolicies.length === 0
    ) {
      opportunities.push({
        ...base,
        id: `opp-deepening-${client.id}`,
        kind: "relationship_deepening",
        valueUsd: Math.round(client.aua * 0.02),
        rationale:
          "No protection cover in place despite significant estate and family obligations.",
        suggestedProductIds: ["prd-whole-of-life", "prd-international-health"],
      });
    }
  }

  return opportunities;
}

/**
 * The workspace Intelligence tab: what changed, why it matters, what to do.
 */
export function intelligenceCards(
  record: DemoClientRecord,
): IntelligenceCard[] {
  const cards: IntelligenceCard[] = [];

  if (record.idleCashPct > record.targetCashPct + IDLE_CASH_THRESHOLD_PCT) {
    const drag =
      Math.round((record.idleCashPct - record.targetCashPct) * 4) / 100;
    cards.push({
      id: "intel-cash",
      what: "Too much cash",
      why: `${record.idleCashPct.toFixed(1)}% in cash vs a ${record.targetCashPct}% target. Roughly ${drag.toFixed(2)}% a year left on the table.`,
      action: "Sketch a staged deployment for the next review.",
      severity: "warning",
      opportunityKind: "cash_deployment",
    });
  }

  const gap = worstGoalGap(record);
  if (gap) {
    cards.push({
      id: "intel-goal",
      what: `${gap.title} gap`,
      why: `Only ${gap.fundedPct}% funded with ${gap.yearsRemaining} year${gap.yearsRemaining === 1 ? "" : "s"} to run — a ${formatCompactCurrency(gap.shortfall)} shortfall.`,
      action: "Propose a top-up schedule.",
      severity: gap.yearsRemaining <= 2 ? "critical" : "warning",
    });
  }

  if (record.heldAwayUsd >= 500_000) {
    cards.push({
      id: "intel-heldaway",
      what: "Assets outside the bank",
      why: `${formatCompactCurrency(record.heldAwayUsd)} in pension and investments held elsewhere.`,
      action: "Ask if they want to consolidate.",
      severity: "info",
      opportunityKind: "held_away",
    });
  }

  if (record.portfolioDriftPct >= 5) {
    cards.push({
      id: "intel-drift",
      what: "Off model",
      why: `${record.portfolioDriftPct.toFixed(1)} points from the ${record.client.riskLevel} target${record.portfolioDriftPct >= RISK_BREACH_THRESHOLD_PCT ? ", past the mandate limit" : ""}.`,
      action: "Draft a rebalance and note why it fits.",
      severity:
        record.portfolioDriftPct >= RISK_BREACH_THRESHOLD_PCT
          ? "critical"
          : "warning",
      opportunityKind: "rebalancing",
    });
  }

  if (record.maturingInvestment) {
    const days = daysUntil(record.maturingInvestment.maturesAt);
    if (days <= MATURITY_WINDOW_DAYS) {
      cards.push({
        id: "intel-maturity",
        what: "Maturity approaching",
        why: `${record.maturingInvestment.name} worth ${formatCompactCurrency(record.maturingInvestment.valueUsd)} matures in ${days} day${days === 1 ? "" : "s"}.`,
        action: "Send reinvestment options before proceeds hit cash.",
        severity: days <= 7 ? "warning" : "info",
        opportunityKind: "maturing",
      });
    }
  }

  const concentration = largestConcentration(record);
  if (concentration && concentration.pct >= 32) {
    cards.push({
      id: "intel-concentration",
      what: "One name is heavy",
      why: `${concentration.name} is ${concentration.pct}% of invested assets.`,
      action: "Agree a trim schedule.",
      severity: "warning",
    });
  }

  if (record.lastEngagementDays > DORMANT_DAYS) {
    cards.push({
      id: "intel-engagement",
      what: "No contact lately",
      why: `${record.lastEngagementDays} days since a real conversation.`,
      action: "Book a catch-up and refresh the plan.",
      severity: "critical",
    });
  }

  if (cards.length === 0) {
    cards.push({
      id: "intel-healthy",
      what: "On track",
      why: `Allocation, cash, and goals look fine for a ${record.client.riskLevel} mandate.`,
      action: "At review, ask about external assets and insurance gaps.",
      severity: "info",
    });
  }

  return cards;
}

/**
 * Suitability gate on Advice and Compliance tabs. Nothing can be actioned
 * without passing these checks, mirroring the Compliance control in the spec.
 */
export function suitabilityChecks(
  record: DemoClientRecord,
): SuitabilityCheck[] {
  const { riskLevel, aua } = record.client;
  const conservativeMandate =
    riskLevel === "conservative" || riskLevel === "moderate";
  const marketable = holdingsValue(record);

  return [
    {
      id: "suit-rebalance",
      action: "Rebalance to model",
      verdict: "suitable",
      reason: "Restores the agreed allocation and reduces mandate risk.",
    },
    {
      id: "suit-cash",
      action: "Cash deployment",
      verdict: excessCash(record) > 0 ? "suitable" : "review",
      reason:
        excessCash(record) > 0
          ? "Deploying to the agreed sleeves is within mandate."
          : "Cash is already at or below target — no action required.",
    },
    {
      id: "suit-structured",
      action: "Structured note",
      verdict: conservativeMandate ? "blocked" : "review",
      reason: conservativeMandate
        ? `Aggressive product risk against a ${riskLevel} mandate, with no appropriateness assessment on file.`
        : "Permitted subject to a structured product appropriateness assessment.",
    },
    {
      id: "suit-private",
      action: "Private markets",
      verdict:
        aua >= 5_000_000 && (riskLevel === "growth" || riskLevel === "aggressive")
          ? "review"
          : "blocked",
      reason:
        aua >= 5_000_000 && (riskLevel === "growth" || riskLevel === "aggressive")
          ? "Meets professional client and liquidity thresholds — needs lock-up acknowledgement."
          : "Below the liquid net worth threshold or outside the risk band.",
    },
    {
      id: "suit-lombard",
      action: "Lombard facility",
      verdict: marketable >= 1_000_000 ? "suitable" : "blocked",
      reason:
        marketable >= 1_000_000
          ? "Eligible marketable collateral covers the requested advance."
          : "Insufficient eligible collateral to support a facility.",
    },
  ];
}

export type AdvisorySessionMetrics = {
  used: number;
  included: number;
  remaining: number;
};

export type BookMetrics = {
  totalAua: number;
  totalAum: number;
  clientsWithMixedMandate: number;
  aumGrowthPct: number;
  revenueQtd: number;
  netFlowQtd: number;
  clientCount: number;
  activeClients: number;
  averageAua: number;
  reviewsDue: number;
  reviewsOverdue: number;
  onboarding: number;
  atRisk: number;
  riskBreaches: number;
  idleCashTotal: number;
  idleCashClients: number;
  escalations: number;
  weightedPerformancePct: number;
  advisorySessions: AdvisorySessionMetrics;
};

export function aggregateAdvisorySessions(
  entitlements: Record<
    string,
    { used: number; included: number; remaining: number }
  >,
  clientIds: Set<string>,
): AdvisorySessionMetrics {
  let used = 0;
  let included = 0;

  for (const [clientId, entitlement] of Object.entries(entitlements)) {
    if (!clientIds.has(clientId)) {
      continue;
    }
    used += entitlement.used;
    included += entitlement.included;
  }

  return {
    used,
    included,
    remaining: Math.max(included - used, 0),
  };
}

export function bookMetrics(
  records: DemoClientRecord[],
  escalations: number,
  advisorySessions: AdvisorySessionMetrics = { used: 0, included: 0, remaining: 0 },
): BookMetrics {
  const totalAua = records.reduce(
    (total, record) => total + record.client.aua,
    0,
  );
  const totalAum = records.reduce(
    (total, record) => total + record.client.aum,
    0,
  );
  const clientsWithMixedMandate = records.filter(
    (record) =>
      record.client.aum > 0 && record.client.aua > record.client.aum,
  ).length;
  const idleCashRecords = records.filter(
    (record) =>
      record.idleCashPct > record.targetCashPct + IDLE_CASH_THRESHOLD_PCT,
  );
  const weightedPerformance =
    totalAum > 0
      ? records.reduce(
          (total, record) =>
            total + record.performanceYtdPct * record.client.aum,
          0,
        ) / totalAum
      : totalAua > 0
        ? records.reduce(
            (total, record) =>
              total + record.performanceYtdPct * record.client.aua,
            0,
          ) / totalAua
        : 0;

  return {
    totalAua,
    totalAum,
    clientsWithMixedMandate,
    aumGrowthPct: Math.round(weightedPerformance * 10) / 10,
    revenueQtd: records.reduce(
      (total, record) => total + record.revenueQtdUsd,
      0,
    ),
    netFlowQtd: records.reduce(
      (total, record) => total + record.netFlowQtdUsd,
      0,
    ),
    clientCount: records.length,
    activeClients: records.filter(
      (record) => record.client.status === "active",
    ).length,
    averageAua: records.length ? Math.round(totalAua / records.length) : 0,
    reviewsDue: records.filter((record) => {
      const days = daysUntil(record.client.nextReviewAt);
      return days >= 0 && days <= 7;
    }).length,
    reviewsOverdue: records.filter(
      (record) => daysUntil(record.client.nextReviewAt) < 0,
    ).length,
    onboarding: records.filter(
      (record) => record.client.status === "onboarding",
    ).length,
    atRisk: records.filter(
      (record) => record.lastEngagementDays > DORMANT_DAYS,
    ).length,
    riskBreaches: records.filter(
      (record) => record.portfolioDriftPct >= RISK_BREACH_THRESHOLD_PCT,
    ).length,
    idleCashTotal: idleCashRecords.reduce(
      (total, record) => total + excessCash(record),
      0,
    ),
    idleCashClients: idleCashRecords.length,
    escalations,
    weightedPerformancePct: Math.round(weightedPerformance * 10) / 10,
    advisorySessions,
  };
}

const SEVERITY_WEIGHT: Record<DemoAlert["severity"], number> = {
  critical: 30,
  warning: 12,
  info: 4,
};

export type PriorityClient = {
  record: DemoClientRecord;
  score: number;
  reasons: string[];
};

/**
 * Ranks the book by how much attention each relationship needs, weighting
 * alert severity first and relationship size second.
 */
export function priorityClients(
  records: DemoClientRecord[],
  alerts: DemoAlert[],
  limit = 5,
): PriorityClient[] {
  const byClient = new Map<string, DemoAlert[]>();

  for (const alert of alerts) {
    if (!alert.clientId) continue;
    const existing = byClient.get(alert.clientId);
    if (existing) {
      existing.push(alert);
    } else {
      byClient.set(alert.clientId, [alert]);
    }
  }

  const maxAua = Math.max(...records.map((record) => record.client.aua), 1);

  return records
    .map((record) => {
      const clientAlerts = byClient.get(record.client.id) ?? [];
      const alertScore = clientAlerts.reduce(
        (total, alert) => total + SEVERITY_WEIGHT[alert.severity],
        0,
      );

      return {
        record,
        score: alertScore + (record.client.aua / maxAua) * 10,
        reasons: clientAlerts.map((alert) => alert.title),
      };
    })
    .filter((entry) => entry.reasons.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export { daysUntil };
