import "server-only";

import { cashBalance, intelligenceCards } from "@/lib/demo/insights";
import type { DemoClientRecord } from "@/lib/demo/types";
import { FIRM_LEGAL_LINE } from "@/lib/reports/firm";
import { formatLongDate } from "@/lib/reports/format";
import { ALLOCATION_COLORS } from "@/lib/reports/pdf/report-theme";
import type {
  InvestmentReportData,
  ReportAllocationSlice,
  ReportPerformanceRow,
  ReportSnapshotRow,
  ReportTemplateKey,
  ReportTransactionRow,
} from "@/lib/reports/types";

const TEMPLATE_META: Record<
  ReportTemplateKey,
  { title: string; months: number }
> = {
  quarterly_review: { title: "Quarterly Review", months: 3 },
  annual_review: { title: "Annual Review", months: 12 },
  portfolio_statement: { title: "Portfolio Statement", months: 6 },
};

/**
 * How much of the portfolio's move each asset class is assumed to carry.
 * Keeps the per-class figures internally consistent with the headline return
 * instead of inventing unrelated numbers per row.
 */
const CLASS_BETA: Array<{ match: RegExp; beta: number }> = [
  { match: /cash|deposit|money market/i, beta: 0.15 },
  { match: /bond|fixed income|credit|treasur/i, beta: 0.4 },
  { match: /real estate|propert/i, beta: 0.7 },
  { match: /alternative|hedge|commodit/i, beta: 1 },
  { match: /equit|stock|share/i, beta: 1.4 },
  { match: /private|venture/i, beta: 1.6 },
];

function betaFor(label: string): number {
  return CLASS_BETA.find((entry) => entry.match.test(label))?.beta ?? 1;
}

function isCashClass(label: string): boolean {
  return /cash|deposit|money market/i.test(label);
}

/**
 * Seed performance points are labelled "Sep", "Aug" — not ISO months — so
 * dates are recovered from position in the trailing series (last point = now).
 */
function dateMonthsAgo(monthsAgo: number): Date {
  const date = new Date();
  date.setDate(15);
  date.setHours(12, 0, 0, 0);
  date.setMonth(date.getMonth() - monthsAgo);
  return date;
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

function yearsSince(iso: string): number {
  const years =
    (Date.now() - new Date(iso).getTime()) / (365.25 * 24 * 60 * 60 * 1000);

  return Math.max(years, 0.25);
}

function reference(clientId: string, template: ReportTemplateKey): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = template
    .split("_")
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return `${prefix}-${clientId.toUpperCase()}-${stamp}`;
}

/**
 * The demo store holds monthly portfolio values and contributions rather than
 * a transaction ledger, so the activity pages are derived from those flows
 * plus the standing advisory fee. Everything reconciles to the same series the
 * performance pages use.
 */
function buildTransactions(
  months: Array<{
    month: string;
    value: number;
    contributions: number;
    date: Date;
  }>,
): {
  transactions: ReportTransactionRow[];
  contributions: ReportTransactionRow[];
  withdrawals: ReportTransactionRow[];
} {
  const contributions: ReportTransactionRow[] = [];
  const withdrawals: ReportTransactionRow[] = [];
  const fees: ReportTransactionRow[] = [];

  for (const [index, entry] of months.entries()) {
    const date = entry.date.toISOString();

    if (entry.contributions > 0) {
      contributions.push({
        id: `con-${entry.month}-${index}`,
        date,
        amountUsd: entry.contributions,
        description: "Contribution to advisory portfolio",
      });
    }

    if (entry.contributions < 0) {
      withdrawals.push({
        id: `wdr-${entry.month}-${index}`,
        date,
        amountUsd: entry.contributions,
        description: "Withdrawal to nominated account",
      });
    }

    // Advisory fee is billed quarterly in arrears at 0.25% of period value.
    if (index % 3 === 2) {
      fees.push({
        id: `fee-${entry.month}-${index}`,
        date,
        amountUsd: -Math.round(entry.value * 0.0025),
        description: "Quarterly advisory fee",
      });
    }
  }

  const transactions = [...contributions, ...withdrawals, ...fees].sort(
    (a, b) => b.date.localeCompare(a.date),
  );

  return { transactions, contributions, withdrawals };
}

function buildAllocation(record: DemoClientRecord): ReportAllocationSlice[] {
  const total = record.detail.allocation.reduce(
    (sum, slice) => sum + slice.value,
    0,
  );

  return record.detail.allocation.map((slice, index) => ({
    key: slice.label,
    label: slice.label,
    valueUsd: slice.value,
    allocationPct: total > 0 ? (slice.value / total) * 100 : 0,
    color: ALLOCATION_COLORS[index % ALLOCATION_COLORS.length],
  }));
}

function buildOverviewRows(
  slices: ReportAllocationSlice[],
  periodReturnPct: number,
): ReportSnapshotRow[] {
  return slices.map((slice) => {
    const cash = isCashClass(slice.label);
    const changePct = cash ? 0 : periodReturnPct * betaFor(slice.label);
    const previous = slice.valueUsd / (1 + changePct / 100);

    return {
      key: slice.key,
      label: slice.label,
      previousValueUsd: previous,
      currentValueUsd: slice.valueUsd,
      periodChangeUsd: slice.valueUsd - previous,
      periodChangePct: cash ? null : changePct,
      ytdPct: cash ? null : changePct,
      isCash: cash,
    };
  });
}

function buildPerformanceRows(
  record: DemoClientRecord,
  slices: ReportAllocationSlice[],
): ReportPerformanceRow[] {
  const years = yearsSince(record.client.joinedAt);

  const costByClass = new Map<string, number>();

  for (const holding of record.detail.holdings) {
    const cost = holding.cost_basis ?? holding.current_value ?? 0;
    costByClass.set(
      holding.asset_type,
      (costByClass.get(holding.asset_type) ?? 0) + cost,
    );
  }

  return slices
    .filter((slice) => !isCashClass(slice.label))
    .map((slice) => {
      const cost = costByClass.get(slice.label) ?? slice.valueUsd;
      const gain = slice.valueUsd - cost;
      const inceptionPct = cost > 0 ? (gain / cost) * 100 : null;
      const annualised =
        inceptionPct == null
          ? null
          : (Math.pow(1 + inceptionPct / 100, 1 / years) - 1) * 100;

      return {
        key: slice.key,
        label: slice.label,
        inceptionGainUsd: gain,
        inceptionPct,
        annualisedReturnPct: annualised,
      };
    });
}

function buildExecutiveSummary(
  record: DemoClientRecord,
  periodLabel: string,
  periodReturnPct: number,
): string {
  const { client } = record;
  const direction = periodReturnPct >= 0 ? "gained" : "declined by";
  const cash = cashBalance(record);

  return [
    `Over ${periodLabel} the portfolio ${direction} ${Math.abs(periodReturnPct).toFixed(1)}%, against a ${client.riskLevel} mandate.`,
    `Total assets under advisement stand at ${Math.round(client.aua).toLocaleString("en-US")} ${client.currency}, of which ${Math.round(cash).toLocaleString("en-US")} is held in cash — ${record.idleCashPct.toFixed(1)}% of the portfolio against a ${record.targetCashPct}% target.`,
    record.portfolioDriftPct >= 5
      ? `Allocation has drifted ${record.portfolioDriftPct.toFixed(1)} percentage points from the model and a rebalance is recommended.`
      : "Allocation remains within tolerance of the agreed model.",
    `${record.detail.goalsMeta.activeGoals} financial goals are active, requiring ${Math.round(record.detail.goalsMeta.totalMonthlyNeeded).toLocaleString("en-US")} ${client.currency} of monthly funding in aggregate.`,
  ].join(" ");
}

const IMPORTANT_NOTICES = [
  "Valuations are indicative and taken at the close of the statement period. Private market positions are carried at the most recent manager valuation.",
  "Past performance is not a reliable indicator of future results. The value of investments and the income from them can fall as well as rise.",
  "Please review your personal and financial details and notify your relationship manager of any change that may affect the suitability of your mandate.",
];

const DISCLAIMER_BODY =
  `This report has been prepared by ${FIRM_LEGAL_LINE} for the named client and is confidential. It is provided for information only and does not constitute an offer, solicitation or personal recommendation to buy or sell any investment. The information is believed to be accurate at the date of preparation but is not guaranteed and may change without notice. Performance figures are net of the advisory fee and gross of any withholding tax. Where positions are held in currencies other than the reporting currency, returns will be affected by exchange rate movements. Clients should consider their own circumstances and, where appropriate, seek independent tax and legal advice before acting on any information contained in this report.`;

export function assembleInvestmentReportData(
  record: DemoClientRecord,
  template: ReportTemplateKey,
  advisor: { name: string; email: string; title: string } | null,
): InvestmentReportData {
  const { client, detail } = record;
  const meta = TEMPLATE_META[template];

  const series = detail.portfolioPerformance;
  const window = series.slice(Math.max(series.length - meta.months - 1, 0));
  const datedWindow = window.map((entry, index) => {
    const date = dateMonthsAgo(window.length - 1 - index);

    return {
      ...entry,
      date,
      label: formatMonthYear(date),
    };
  });
  const opening = datedWindow[0];
  const closing = datedWindow[datedWindow.length - 1];
  const periodMonths = datedWindow.slice(1);

  const netContributions = periodMonths.reduce(
    (total, entry) => total + entry.contributions,
    0,
  );

  const periodGainUsd = closing.value - opening.value - netContributions;
  const periodReturnPct =
    opening.value > 0 ? (periodGainUsd / opening.value) * 100 : 0;

  const allocationSlices = buildAllocation(record);
  const overviewRows = buildOverviewRows(allocationSlices, periodReturnPct);
  const performanceRows = buildPerformanceRows(record, allocationSlices);
  const { transactions, contributions, withdrawals } =
    buildTransactions(periodMonths);

  const cards = intelligenceCards(record);

  return {
    clientName: `${client.firstName} ${client.lastName}`,
    clientNumber: client.id.toUpperCase(),
    reference: reference(client.id, template),
    preparedOn: formatLongDate(new Date().toISOString()),
    reportKindTitle: meta.title,
    statementPeriodLabel: `${opening.label} to ${closing.label}`,
    previousStatementLabel: opening.label,
    currentStatementLabel: closing.label,
    address: {
      line1: detail.user.city ? `${detail.user.city}` : client.location,
      city: client.location,
      country: detail.user.resident_country ?? client.location,
    },
    currency: client.currency,
    riskMandate:
      detail.riskAssessment?.result?.risk_band ??
      client.riskLevel.charAt(0).toUpperCase() + client.riskLevel.slice(1),
    totalPortfolioValueUsd: closing.value,
    periodGainUsd,
    periodReturnPct,
    overviewRows,
    performanceRows,
    allocationSlices,
    historyPoints: datedWindow.map((entry) => ({
      label: entry.label,
      valueUsd: entry.value,
    })),
    goals: detail.goals.map((goal) => {
      const target = goal.target ?? 0;

      return {
        title: goal.title,
        category: goal.category,
        currentUsd: goal.current,
        targetUsd: target,
        fundedPct: target > 0 ? (goal.current / target) * 100 : 0,
        yearsRemaining: goal.yearsRemaining ?? 0,
      };
    }),
    transactions,
    contributions,
    withdrawals,
    executiveSummary: buildExecutiveSummary(
      record,
      `${meta.months} months`,
      periodReturnPct,
    ),
    recommendations:
      cards.length > 0
        ? cards.map((card) => card.action)
        : ["No action is required ahead of the next scheduled review."],
    importantNotices: IMPORTANT_NOTICES,
    advisor: advisor
      ? {
          fullName: advisor.name,
          email: advisor.email,
          phone: null,
          title: advisor.title,
        }
      : null,
    disclaimerTitle: "Important information and disclaimer",
    disclaimerBody: DISCLAIMER_BODY,
    totalPages: 6,
  };
}
