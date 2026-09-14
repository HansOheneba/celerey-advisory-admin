import "server-only";

import { formatCompactCurrency, formatDate } from "@/lib/format";
import {
  cashBalance,
  excessCash,
  holdingsValue,
  intelligenceCards,
  suitabilityChecks,
  type BookMetrics,
} from "@/lib/demo/insights";
import type {
  DemoAlert,
  DemoClientRecord,
  DemoOpportunity,
  DemoRecommendation,
} from "@/lib/demo/types";

export const ADVISORY_SYSTEM_PROMPT = [
  "You are Celerey Copilot, an analyst supporting relationship managers at a private bank.",
  "You only reason from the client data provided in the prompt. Never invent holdings, balances or dates.",
  "Be specific and quantitative. Reference figures from the data rather than describing them vaguely.",
  "Write in British English, in plain prose. No emoji, no marketing language.",
  "Every recommendation must respect the stated risk mandate and the suitability verdicts supplied.",
  "If the data does not support an answer, say so plainly.",
].join(" ");

/** Data scopes injected into a prompt, surfaced in the AI audit trail. */
export const CLIENT_CONTEXT_SCOPES = [
  "profile",
  "portfolio",
  "cash flow",
  "goals",
  "liabilities",
  "risk mandate",
  "suitability",
  "alerts",
];

export const BOOK_CONTEXT_SCOPES = [
  "book metrics",
  "client summaries",
  "alerts",
  "opportunities",
];

function line(label: string, value: string): string {
  return `${label}: ${value}`;
}

/**
 * Compact, deterministic snapshot of one client. Kept terse so the whole
 * relationship fits comfortably inside the model's context window.
 */
export function buildClientContext(record: DemoClientRecord): string {
  const { client, detail } = record;
  const cash = cashBalance(record);
  const cards = intelligenceCards(record);
  const checks = suitabilityChecks(record);

  const sections: string[] = [
    "# Client",
    line("Name", `${client.firstName} ${client.lastName}`),
    line("Segment", record.segment.toUpperCase()),
    line("Status", client.status),
    line("Risk mandate", client.riskLevel),
    line("Location", client.location),
    line("Occupation", detail.user.occupation ?? "unknown"),
    line("Age", String(detail.retirement.currentAge)),
    line("Dependents", String(detail.dependents.length)),
    line("Client since", formatDate(client.joinedAt)),
    line("Last contact", formatDate(client.lastContactAt)),
    line("Next review", formatDate(client.nextReviewAt)),
    "",
    "# Portfolio",
    line("Assets Under Advisory", formatCompactCurrency(client.aua)),
    line("Invested", formatCompactCurrency(holdingsValue(record))),
    line(
      "Cash",
      `${formatCompactCurrency(cash)} (${record.idleCashPct.toFixed(1)}% vs ${record.targetCashPct}% target)`,
    ),
    line("Deployable cash", formatCompactCurrency(excessCash(record))),
    line("Model drift", `${record.portfolioDriftPct.toFixed(1)} percentage points`),
    line("Trailing 12m return", `${record.performanceYtdPct.toFixed(1)}%`),
    line("Assets held away", formatCompactCurrency(record.heldAwayUsd)),
    "",
    "## Holdings",
    ...detail.holdings.map(
      (holding) =>
        `- ${holding.name} (${holding.asset_type}): ${formatCompactCurrency(holding.current_value ?? 0)}`,
    ),
    "",
    "## Allocation",
    ...detail.allocation.map(
      (slice) => `- ${slice.label}: ${slice.percentage}%`,
    ),
    "",
    "# Cash flow (monthly)",
    line("Income", formatCompactCurrency(detail.cashFlowSummary.monthly_income)),
    line(
      "Expenses",
      formatCompactCurrency(detail.cashFlowSummary.monthly_expenses),
    ),
    line(
      "Surplus",
      formatCompactCurrency(detail.cashFlowSummary.monthly_surplus),
    ),
    line("Savings rate", `${detail.cashFlowSummary.savings_rate_pct}%`),
    "",
    "# Goals",
    ...detail.goals.map((goal) => {
      const target = goal.target ?? 0;
      const pct = target > 0 ? Math.round((goal.current / target) * 100) : 0;
      return `- ${goal.title} (${goal.category}): ${formatCompactCurrency(goal.current)} of ${formatCompactCurrency(target)}, ${pct}% funded, ${goal.yearsRemaining ?? "?"} years remaining`;
    }),
  ];

  if (detail.liabilities.length > 0) {
    sections.push(
      "",
      "# Liabilities",
      ...detail.liabilities.map(
        (liability) =>
          `- ${liability.name} with ${liability.lender}: ${formatCompactCurrency(liability.balance)} at ${liability.interestRatePct ?? 0}%`,
      ),
    );
  }

  if (detail.propertyAssets.length > 0) {
    sections.push(
      "",
      "# Property",
      ...detail.propertyAssets.map(
        (property) =>
          `- ${property.name}, ${property.city}: ${formatCompactCurrency(property.current_value ?? 0)}`,
      ),
    );
  }

  if (detail.insurancePolicies.length > 0) {
    sections.push(
      "",
      "# Protection",
      ...detail.insurancePolicies.map(
        (policy) =>
          `- ${policy.name} (${policy.category}) with ${policy.provider}: ${formatCompactCurrency(policy.coverage_amount ?? 0)} cover`,
      ),
    );
  } else {
    sections.push("", "# Protection", "- No protection cover on record");
  }

  sections.push(
    "",
    "# Detected issues",
    ...cards.map((card) => `- ${card.what}: ${card.why}`),
    "",
    "# Suitability verdicts",
    ...checks.map((check) => `- ${check.action}: ${check.verdict} — ${check.reason}`),
  );

  return sections.join("\n");
}

export function buildBookContext(
  records: DemoClientRecord[],
  metrics: BookMetrics,
  alerts: DemoAlert[],
  opportunities: DemoOpportunity[],
  recommendations: DemoRecommendation[],
): string {
  const sections: string[] = [
    "# Book metrics",
    line("Total Assets Under Advisory", formatCompactCurrency(metrics.totalAua)),
    line("Trailing 12m weighted return", `${metrics.aumGrowthPct}%`),
    line("Revenue this quarter", formatCompactCurrency(metrics.revenueQtd)),
    line("Net flows this quarter", formatCompactCurrency(metrics.netFlowQtd)),
    line("Clients", String(metrics.clientCount)),
    line("Risk band breaches", String(metrics.riskBreaches)),
    line("Reviews overdue", String(metrics.reviewsOverdue)),
    line(
      "Idle cash",
      `${formatCompactCurrency(metrics.idleCashTotal)} across ${metrics.idleCashClients} clients`,
    ),
    line("Relationships at risk", String(metrics.atRisk)),
    "",
    "# Clients",
    ...records.map(
      (record) =>
        `- ${record.client.firstName} ${record.client.lastName} (${record.segment}, ${record.client.riskLevel}): ${formatCompactCurrency(record.client.aua)}, cash ${record.idleCashPct.toFixed(1)}%, drift ${record.portfolioDriftPct.toFixed(1)}pts, return ${record.performanceYtdPct.toFixed(1)}%, last contact ${record.lastEngagementDays} days ago`,
    ),
    "",
    "# Open alerts",
    ...alerts
      .slice(0, 20)
      .map(
        (alert) =>
          `- [${alert.severity}] ${alert.clientName ?? "Book"}: ${alert.title} — ${alert.detail}`,
      ),
    "",
    "# Opportunities",
    ...opportunities
      .slice(0, 20)
      .map(
        (opportunity) =>
          `- ${opportunity.clientName}: ${opportunity.kind} worth ${formatCompactCurrency(opportunity.valueUsd)} — ${opportunity.rationale}`,
      ),
  ];

  if (recommendations.length > 0) {
    sections.push(
      "",
      "# Recommendations in flight",
      ...recommendations.map(
        (recommendation) =>
          `- ${recommendation.clientName}: ${recommendation.title} (${recommendation.status}, ${formatCompactCurrency(recommendation.amountUsd)})`,
      ),
    );
  }

  return sections.join("\n");
}

/**
 * Deterministic narrative used when DeepSeek is unavailable. The demo has to
 * keep working offline, and the rule engine already knows what matters.
 */
export function fallbackClientBrief(record: DemoClientRecord): string {
  const { client } = record;
  const cards = intelligenceCards(record);
  const name = `${client.firstName} ${client.lastName}`;

  const paragraphs = [
    `${name} holds ${formatCompactCurrency(client.aua)} under advisory on a ${client.riskLevel} mandate, returning ${record.performanceYtdPct.toFixed(1)}% over the last twelve months. Cash sits at ${record.idleCashPct.toFixed(1)}% against a ${record.targetCashPct}% target and the portfolio is ${record.portfolioDriftPct.toFixed(1)} percentage points from the model allocation.`,
    "What has changed:",
    ...cards.map((card) => `• ${card.what} — ${card.why}`),
    `The next review is scheduled for ${formatDate(client.nextReviewAt)}. Open assigned tasks are tracked in the client workspace. Any product recommendation must clear the suitability checks shown alongside this brief.`,
  ];

  return paragraphs.join("\n\n");
}

export function fallbackBookAnswer(
  question: string,
  metrics: BookMetrics,
  alerts: DemoAlert[],
  opportunities: DemoOpportunity[],
): string {
  const topAlerts = alerts.slice(0, 5);
  const topOpportunities = opportunities.slice(0, 5);

  return [
    `The live AI service is unavailable, so here is the analysis drawn directly from your book data for: "${question}".`,
    `Your book holds ${formatCompactCurrency(metrics.totalAua)} across ${metrics.clientCount} relationships, up ${metrics.aumGrowthPct}% over twelve months, generating ${formatCompactCurrency(metrics.revenueQtd)} in revenue this quarter.`,
    `There are ${metrics.riskBreaches} risk band breaches, ${metrics.reviewsOverdue} overdue reviews and ${formatCompactCurrency(metrics.idleCashTotal)} of idle cash across ${metrics.idleCashClients} clients.`,
    "Highest priority alerts:",
    ...topAlerts.map(
      (alert) => `• ${alert.clientName ?? "Book"} — ${alert.title}: ${alert.detail}`,
    ),
    "Largest opportunities:",
    ...topOpportunities.map(
      (opportunity) =>
        `• ${opportunity.clientName} — ${opportunity.kind.replace(/_/g, " ")} worth ${formatCompactCurrency(opportunity.valueUsd)}: ${opportunity.rationale}`,
    ),
  ].join("\n\n");
}
