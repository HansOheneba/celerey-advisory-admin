/** Report templates an advisor can generate from the workspace. */
export type ReportTemplateKey =
  | "quarterly_review"
  | "annual_review"
  | "portfolio_statement";

export const REPORT_TEMPLATES: Array<{
  key: ReportTemplateKey;
  label: string;
  description: string;
}> = [
  {
    key: "quarterly_review",
    label: "Quarterly review",
    description:
      "Performance, allocation and activity for the most recent quarter.",
  },
  {
    key: "annual_review",
    label: "Annual review",
    description:
      "Full-year performance with since-inception returns and goal progress.",
  },
  {
    key: "portfolio_statement",
    label: "Portfolio statement",
    description: "Positions, valuations and transactions as at today.",
  },
];

export type ReportAddress = {
  line1: string;
  city: string;
  country: string;
};

export type ReportSnapshotRow = {
  key: string;
  label: string;
  previousValueUsd: number;
  currentValueUsd: number;
  periodChangeUsd: number;
  periodChangePct: number | null;
  ytdPct: number | null;
  /** Cash is excluded from performance maths. */
  isCash: boolean;
};

export type ReportPerformanceRow = {
  key: string;
  label: string;
  inceptionGainUsd: number | null;
  inceptionPct: number | null;
  annualisedReturnPct: number | null;
};

export type ReportAllocationSlice = {
  key: string;
  label: string;
  valueUsd: number;
  allocationPct: number;
  color: string;
};

export type ReportTransactionRow = {
  id: string;
  date: string;
  amountUsd: number;
  description: string;
};

export type ReportGoalRow = {
  title: string;
  category: string;
  currentUsd: number;
  targetUsd: number;
  fundedPct: number;
  yearsRemaining: number;
};

export type ReportAdvisor = {
  fullName: string;
  email: string;
  phone: string | null;
  title: string | null;
};

export type ReportHistoryPoint = {
  label: string;
  valueUsd: number;
};

export type InvestmentReportData = {
  clientName: string;
  clientNumber: string;
  reference: string;
  preparedOn: string;
  reportKindTitle: string;
  statementPeriodLabel: string;
  previousStatementLabel: string;
  currentStatementLabel: string;
  address: ReportAddress;
  currency: string;
  riskMandate: string;
  totalPortfolioValueUsd: number;
  periodGainUsd: number;
  periodReturnPct: number;
  overviewRows: ReportSnapshotRow[];
  performanceRows: ReportPerformanceRow[];
  allocationSlices: ReportAllocationSlice[];
  historyPoints: ReportHistoryPoint[];
  goals: ReportGoalRow[];
  transactions: ReportTransactionRow[];
  contributions: ReportTransactionRow[];
  withdrawals: ReportTransactionRow[];
  executiveSummary: string;
  recommendations: string[];
  importantNotices: string[];
  advisor: ReportAdvisor | null;
  disclaimerTitle: string;
  disclaimerBody: string;
  totalPages: number;
};
