import "server-only";

import type {
  Client,
  ClientSegment,
  ClientStatus,
  ClientSubscription,
  RiskLevel,
} from "@/types/client";
import { normalizeClientSegment } from "@/types/client";
import type {
  CashFlowSummary,
  ClientDetail,
  ClientDetailState,
  ClientDetailUser,
} from "@/types/client-detail";

export type ApiClientRow = Partial<Client> & {
  id?: string;
  first_name?: string;
  last_name?: string;
  advisor_id?: string;
  advisor_name?: string;
  risk_level?: string;
  last_contact_at?: string | null;
  last_contact_source?: string | null;
  review_frequency_days?: number;
  next_review_at?: string | null;
  joined_at?: string;
  goals_count?: number;
  internal_notes?: string;
  notes?: string;
};

const CLIENT_STATUSES = new Set<ClientStatus>([
  "active",
  "onboarding",
  "review",
  "inactive",
]);

const RISK_LEVELS = new Set<RiskLevel>([
  "conservative",
  "moderate",
  "growth",
  "aggressive",
]);

const SUBSCRIPTIONS = new Set<ClientSubscription>([
  "not_onboarded",
  "free_trial",
  "celerey_core",
]);

const CURRENCIES = new Set(["USD", "GHS", "GBP"]);

function asClientStatus(value: unknown): ClientStatus {
  return CLIENT_STATUSES.has(value as ClientStatus)
    ? (value as ClientStatus)
    : "onboarding";
}

function asRiskLevel(value: unknown): RiskLevel {
  return RISK_LEVELS.has(value as RiskLevel)
    ? (value as RiskLevel)
    : "moderate";
}

export function asSubscription(value: unknown): ClientSubscription {
  return SUBSCRIPTIONS.has(value as ClientSubscription)
    ? (value as ClientSubscription)
    : "not_onboarded";
}

export function asClientSegment(value: unknown): ClientSegment {
  return normalizeClientSegment(value);
}

function asCurrency(value: unknown): Client["currency"] {
  return CURRENCIES.has(value as string)
    ? (value as Client["currency"])
    : "USD";
}

function toNumber(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

/** Normalize API client rows (camelCase or snake_case) into our Client shape. */
export function normalizeClient(row: ApiClientRow): Client {
  const emptyDate = "";

  return {
    id: String(row.id ?? ""),
    firstName: String(row.firstName ?? row.first_name ?? ""),
    lastName: String(row.lastName ?? row.last_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    status: asClientStatus(row.status),
    riskLevel: asRiskLevel(row.riskLevel ?? row.risk_level),
    subscription: asSubscription(row.subscription),
    segment: asClientSegment(row.segment),
    aua: toNumber(row.aua),
    aum: toNumber(row.aum),
    currency: asCurrency(row.currency),
    advisorId: String(row.advisorId ?? row.advisor_id ?? ""),
    advisorName: String(row.advisorName ?? row.advisor_name ?? ""),
    location: String(row.location ?? "—"),
    lastContactAt: String(
      row.lastContactAt ?? row.last_contact_at ?? emptyDate,
    ),
    lastContactSource:
      typeof row.lastContactSource === "string"
        ? (row.lastContactSource as Client["lastContactSource"])
        : typeof row.last_contact_source === "string"
          ? (row.last_contact_source as Client["lastContactSource"])
          : null,
    reviewFrequencyDays:
      typeof row.reviewFrequencyDays === "number"
        ? row.reviewFrequencyDays
        : toNumber(row.review_frequency_days) || 180,
    nextReviewAt: String(row.nextReviewAt ?? row.next_review_at ?? emptyDate),
    joinedAt: String(row.joinedAt ?? row.joined_at ?? emptyDate),
    goalsCount:
      typeof row.goalsCount === "number"
        ? row.goalsCount
        : toNumber(row.goals_count),
  };
}

type RawMoneyRow = {
  id?: number | string;
  name?: string;
  amount?: string | number;
  amount_monthly?: number;
  essential?: boolean;
  is_recurring?: boolean;
  recurring_type?: string;
  start_date?: string;
  end_date?: string | null;
};

type RawHolding = {
  holding_id?: string;
  name?: string;
  symbol?: string;
  asset_type?: string;
  quantity?: string | number;
  cost_basis?: string | number;
  current_value?: string | number | null;
  [key: string]: unknown;
};

type RawGoal = Record<string, unknown> & {
  goal_id?: string;
  id?: string;
  user_id?: string;
  title?: string;
  category?: string | null;
  description?: string | null;
  priority?: number | string;
  current_amount?: number;
  target_amount?: number | null;
  monthly_contribution_needed?: number;
  status?: string;
  years_remaining?: number;
};

type RawDetailState = {
  user?: Partial<ClientDetailUser>;
  riskAssessment?: ClientDetailState["riskAssessment"];
  incomeRows?: RawMoneyRow[];
  expenseCategories?: RawMoneyRow[];
  goals?: RawGoal[];
  goalsMeta?: Partial<Record<string, number>> | null;
  holdings?: RawHolding[];
  accounts?: ClientDetailState["accounts"];
  propertyAssets?: ClientDetailState["propertyAssets"];
  liabilities?: ClientDetailState["liabilities"];
  insurancePolicies?: ClientDetailState["insurancePolicies"];
  retirement?: {
    config?: Partial<Record<string, number | string>>;
    projections?: Record<string, number | boolean>;
  } | null;
  emergencyFund?: {
    cash_balance?: string | number;
    target_months?: number;
    storage_location?: string | null;
    computed?: Record<string, unknown> | null;
  } | null;
  cashFlowHistory?: ClientDetailState["cashFlowHistory"];
  cashFlowSummary?: Partial<CashFlowSummary> | null;
  portfolioPerformance?: ClientDetailState["portfolioPerformance"];
  allocation?: ClientDetailState["allocation"];
  taxProfile?: ClientDetailState["taxProfile"] | null;
  dependents?: ClientDetailState["dependents"];
  retirementProjections?: ClientDetailState["retirementProjections"];
  freshness?: Array<{
    section: string;
    updatedAt?: string;
    updated_at?: string;
  }>;
  profileCompletionScore?: number;
};

export type RawClientDetail = {
  id?: string;
  subscription?: string;
  summary?: ApiClientRow | null;
  state?: RawDetailState | null;
};

function mapMoneyRow(row: RawMoneyRow) {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    amount: toNumber(row.amount_monthly ?? row.amount),
    isRecurring: row.is_recurring ?? false,
    recurringType: String(row.recurring_type ?? ""),
    startDate: String(row.start_date ?? ""),
    endDate: row.end_date ?? null,
  };
}

function optionalNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const num = toNumber(value);
  return Number.isFinite(num) ? num : undefined;
}

function mapHolding(
  holding: RawHolding,
): ClientDetailState["holdings"][number] {
  return {
    ...holding,
    holding_id: String(holding.holding_id ?? ""),
    name: String(holding.name ?? ""),
    symbol: holding.symbol != null ? String(holding.symbol) : undefined,
    asset_type: String(holding.asset_type ?? ""),
    quantity: optionalNumber(holding.quantity),
    cost_basis: optionalNumber(holding.cost_basis),
    current_value: optionalNumber(holding.current_value),
  };
}

function mapGoal(goal: RawGoal): ClientDetailState["goals"][number] {
  return {
    ...goal,
    id: String(goal.goal_id ?? goal.id ?? ""),
    userId: String(goal.user_id ?? ""),
    title: String(goal.title ?? ""),
    category: String(goal.category ?? ""),
    description: String(goal.description ?? ""),
    priority: goal.priority ?? "",
    current: toNumber(goal.current_amount),
    target: goal.target_amount != null ? toNumber(goal.target_amount) : undefined,
    monthlyContribution: toNumber(goal.monthly_contribution_needed),
    status: goal.status,
    yearsRemaining: goal.years_remaining,
  };
}

function buildCashFlowSummary(
  raw: Partial<CashFlowSummary> | null | undefined,
  incomeRows: ClientDetailState["incomeRows"],
  expenseCategories: ClientDetailState["expenseCategories"],
  currency: string,
): CashFlowSummary {
  if (raw) {
    return {
      monthly_income: toNumber(raw.monthly_income),
      monthly_expenses: toNumber(raw.monthly_expenses),
      monthly_surplus: toNumber(raw.monthly_surplus),
      savings_rate_pct: toNumber(raw.savings_rate_pct),
      currency: raw.currency ?? currency,
    };
  }

  // The detail endpoint can return cashFlowSummary as null for fresh
  // profiles; derive the summary from the monthly income/expense rows.
  const monthlyIncome = incomeRows.reduce((sum, row) => sum + row.amount, 0);
  const monthlyExpenses = expenseCategories.reduce(
    (sum, row) => sum + row.amount,
    0,
  );
  const monthlySurplus = monthlyIncome - monthlyExpenses;

  return {
    monthly_income: monthlyIncome,
    monthly_expenses: monthlyExpenses,
    monthly_surplus: monthlySurplus,
    savings_rate_pct:
      monthlyIncome > 0
        ? Math.round((monthlySurplus / monthlyIncome) * 100)
        : 0,
    currency,
  };
}

/** Normalize the raw admin.clients.detail payload into our domain types. */
export function normalizeClientDetail(raw: RawClientDetail): {
  client: Client;
  detail: ClientDetail;
} {
  const client = normalizeClient(raw.summary ?? { id: raw.id });
  const rawState = raw.state ?? {};

  const user: ClientDetailUser = {
    user_id: client.id,
    user_type: "user",
    email: client.email,
    first_name: client.firstName,
    last_name: client.lastName,
    display_name: `${client.firstName} ${client.lastName}`.trim(),
    phone_number: null,
    resident_country: null,
    city: null,
    date_of_birth: null,
    currency: client.currency,
    occupation: null,
    marital_status: null,
    gender: null,
    prefix: null,
    dependents: null,
    citizenships: [],
    risk_profile: null,
    account_mode: null,
    bio: null,
    is_active: true,
    created_at: client.joinedAt,
    updated_at: client.joinedAt,
    ...rawState.user,
  };

  const incomeRows = (rawState.incomeRows ?? []).map(mapMoneyRow);
  const expenseCategories = (rawState.expenseCategories ?? []).map((row) => ({
    ...mapMoneyRow(row),
    essential: row.essential ?? false,
  }));

  const goalsMeta = rawState.goalsMeta ?? {};
  const retirementConfig = rawState.retirement?.config ?? {};
  const emergencyFund = rawState.emergencyFund;
  const emergencyComputed = emergencyFund?.computed;

  const state: ClientDetailState = {
    user,
    riskAssessment: rawState.riskAssessment ?? null,
    incomeRows,
    expenseCategories,
    goals: (rawState.goals ?? []).map(mapGoal),
    goalsMeta: {
      totalMonthlyNeeded: toNumber(goalsMeta.total_monthly_needed),
      totalGoals: toNumber(goalsMeta.total_goals),
      completedGoals: toNumber(goalsMeta.completed_goals),
      activeGoals: toNumber(goalsMeta.active_goals),
    },
    holdings: (rawState.holdings ?? []).map(mapHolding),
    accounts: rawState.accounts ?? [],
    propertyAssets: rawState.propertyAssets ?? [],
    liabilities: rawState.liabilities ?? [],
    insurancePolicies: rawState.insurancePolicies ?? [],
    retirement: {
      currentAge: toNumber(retirementConfig.currentAge),
      retirementAge: toNumber(retirementConfig.retirementAge),
      lifeExpectancy: toNumber(retirementConfig.lifeExpectancy),
      currentInvested: toNumber(retirementConfig.currentInvested),
      monthlySavings: toNumber(retirementConfig.monthlySavings),
      existingPensionBalance: toNumber(
        retirementConfig.existingPensionBalance,
      ),
      monthlyPensionContribution: toNumber(
        retirementConfig.monthlyPensionContribution,
      ),
      expectedReturnPct: toNumber(retirementConfig.expectedReturnPct),
      inflationPct: toNumber(retirementConfig.inflationPct),
      safeWithdrawalRatePct: toNumber(retirementConfig.safeWithdrawalRatePct),
      desiredMonthlyIncome: toNumber(retirementConfig.desiredMonthlyIncome),
      storageLocation:
        typeof retirementConfig.storageLocation === "string"
          ? retirementConfig.storageLocation
          : typeof retirementConfig.storage_location === "string"
            ? retirementConfig.storage_location
            : undefined,
      projections: rawState.retirement?.projections,
    },
    emergencyFund: {
      targetMonths: toNumber(emergencyFund?.target_months),
      currentCashBalance: toNumber(emergencyFund?.cash_balance),
      storageLocation: emergencyFund?.storage_location ?? undefined,
      computed: emergencyComputed
        ? {
            ...emergencyComputed,
            monthsCovered: toNumber(emergencyComputed.runway_months),
            gap: toNumber(emergencyComputed.shortfall),
          }
        : undefined,
    },
    cashFlowHistory: rawState.cashFlowHistory ?? [],
    cashFlowSummary: buildCashFlowSummary(
      rawState.cashFlowSummary,
      incomeRows,
      expenseCategories,
      user.currency,
    ),
    portfolioPerformance: rawState.portfolioPerformance ?? [],
    allocation: rawState.allocation ?? [],
    taxProfile: rawState.taxProfile ?? null,
    dependents: rawState.dependents ?? [],
    freshness: (rawState.freshness ?? []).map((item) => ({
      section: item.section,
      updatedAt: String(item.updatedAt ?? item.updated_at ?? ""),
    })),
    profileCompletionScore: toNumber(rawState.profileCompletionScore),
    retirementProjections:
      rawState.retirementProjections ??
      rawState.retirement?.projections ??
      undefined,
  };

  return {
    client,
    detail: {
      id: client.id,
      subscription: asSubscription(raw.subscription ?? client.subscription),
      state,
    },
  };
}
