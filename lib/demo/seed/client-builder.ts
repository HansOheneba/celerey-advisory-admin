import type {
  Client,
  ClientStatus,
  ClientSubscription,
  RiskLevel,
} from "@/types/client";
import type { ClientDetailState } from "@/types/client-detail";
import type { ClientSegment, DemoClientRecord } from "@/lib/demo/types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Seed dates are relative to seed time so the demo always looks current. */
export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

export function monthLabel(monthsAgo: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  return date.toLocaleDateString("en-US", { month: "short" });
}

export type HoldingSpec = {
  name: string;
  symbol?: string;
  assetType: string;
  value: number;
  costBasis: number;
  quantity?: number;
};

export type GoalSpec = {
  title: string;
  category: string;
  target: number;
  current: number;
  monthly: number;
  years: number;
  priority: number;
  status?: string;
};

export type AccountSpec = {
  name: string;
  institution: string;
  type: string;
  balance: number;
};

export type PropertySpec = {
  name: string;
  type: string;
  country: string;
  city: string;
  purchase: number;
  current: number;
};

export type LiabilitySpec = {
  name: string;
  lender: string;
  type: string;
  balance: number;
  ratePct: number;
  monthly: number;
};

export type InsuranceSpec = {
  category: string;
  provider: string;
  name: string;
  coverage: number;
  premium: number;
};

export type MoneySpec = { name: string; amount: number; essential?: boolean };

export type DependentSpec = {
  name: string;
  relationship: string;
  ageYears: number;
  reliance?: string;
};

export type ClientSpec = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ClientStatus;
  riskLevel: RiskLevel;
  subscription: ClientSubscription;
  segment: ClientSegment;
  currency: Client["currency"];
  advisorId: string;
  advisorName: string;
  location: string;
  city: string;
  country: string;
  residency: string;
  occupation: string;
  maritalStatus: string;
  gender: string;
  age: number;
  citizenships: string[];
  joinedDaysAgo: number;
  lastContactDaysAgo: number;
  nextReviewInDays: number;
  bio: string;
  notes: string;
  holdings: HoldingSpec[];
  goals: GoalSpec[];
  accounts: AccountSpec[];
  properties?: PropertySpec[];
  liabilities?: LiabilitySpec[];
  insurance?: InsuranceSpec[];
  income: MoneySpec[];
  expenses: MoneySpec[];
  dependents?: DependentSpec[];
  targetCashPct: number;
  heldAwayUsd?: number;
  portfolioDriftPct: number;
  revenueQtdUsd: number;
  netFlowQtdUsd: number;
  performanceYtdPct: number;
  retirementAge?: number;
  desiredMonthlyIncome?: number;
  emergencyTargetMonths?: number;
  maturingInvestment?: {
    name: string;
    valueUsd: number;
    maturesInDays: number;
  } | null;
  effectiveTaxRatePct?: number;
  marginalTaxRatePct?: number;
};

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function round(value: number): number {
  return Math.round(value);
}

const RISK_BAND_COPY: Record<RiskLevel, { description: string; strategy: string }> =
  {
    conservative: {
      description:
        "Prioritises capital preservation and predictable income over growth.",
      strategy: "Income-led allocation with a short duration bias.",
    },
    moderate: {
      description:
        "Accepts measured volatility for real returns above inflation.",
      strategy: "Balanced allocation across income and growth sleeves.",
    },
    growth: {
      description:
        "Comfortable with drawdowns in exchange for long-horizon compounding.",
      strategy: "Growth-tilted allocation with satellite alternatives.",
    },
    aggressive: {
      description:
        "Seeks maximum long-term growth and tolerates significant drawdowns.",
      strategy: "Equity and private markets led allocation.",
    },
  };

function buildAllocation(holdings: HoldingSpec[], cash: number) {
  const byType = new Map<string, number>();

  for (const holding of holdings) {
    byType.set(holding.assetType, (byType.get(holding.assetType) ?? 0) + holding.value);
  }

  if (cash > 0) {
    byType.set("Cash", (byType.get("Cash") ?? 0) + cash);
  }

  const total = sum([...byType.values()]);

  return [...byType.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value: round(value),
      percentage: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
    }));
}

/**
 * Twelve monthly points ending at the current portfolio value, shaped by the
 * client's trailing return so the workspace chart matches the headline figure.
 */
function buildPerformance(currentValue: number, ytdPct: number) {
  const startValue = currentValue / (1 + ytdPct / 100);
  const monthlyGrowth = (currentValue - startValue) / 11;

  return Array.from({ length: 12 }, (_, index) => {
    const drift = index === 0 ? 0 : Math.sin(index * 1.7) * currentValue * 0.012;
    return {
      month: monthLabel(11 - index),
      value: round(startValue + monthlyGrowth * index + drift),
      contributions: round(monthlyGrowth * 0.35),
    };
  });
}

function buildCashFlowHistory(income: number, expenses: number) {
  return Array.from({ length: 6 }, (_, index) => {
    const variance = 1 + Math.sin(index * 1.3) * 0.06;
    const monthIncome = round(income * variance);
    const monthExpenses = round(expenses * (1 + Math.cos(index * 1.1) * 0.05));

    return {
      month: monthLabel(5 - index),
      income: monthIncome,
      expenses: monthExpenses,
      surplus: monthIncome - monthExpenses,
    };
  });
}

export function buildClientRecord(spec: ClientSpec): DemoClientRecord {
  const holdingsValue = sum(spec.holdings.map((holding) => holding.value));
  const cashBalance = sum(spec.accounts.map((account) => account.balance));
  const aua = round(holdingsValue + cashBalance);
  const monthlyIncome = sum(spec.income.map((row) => row.amount));
  const monthlyExpenses = sum(spec.expenses.map((row) => row.amount));
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const idleCashPct = aua > 0 ? Math.round((cashBalance / aua) * 1000) / 10 : 0;
  const joinedAt = daysFromNow(-spec.joinedDaysAgo);
  const retirementAge = spec.retirementAge ?? 65;
  const emergencyTargetMonths = spec.emergencyTargetMonths ?? 6;
  const emergencyGap = Math.max(
    0,
    monthlyExpenses * emergencyTargetMonths - cashBalance,
  );

  const client: Client = {
    id: spec.id,
    firstName: spec.firstName,
    lastName: spec.lastName,
    email: spec.email,
    phone: spec.phone,
    status: spec.status,
    riskLevel: spec.riskLevel,
    subscription: spec.subscription,
    aua,
    currency: spec.currency,
    advisorId: spec.advisorId,
    advisorName: spec.advisorName,
    location: spec.location,
    lastContactAt: daysFromNow(-spec.lastContactDaysAgo),
    nextReviewAt: daysFromNow(spec.nextReviewInDays),
    joinedAt,
    goalsCount: spec.goals.length,
    notes: spec.notes,
  };

  const birthYear = new Date().getFullYear() - spec.age;
  const bandCopy = RISK_BAND_COPY[spec.riskLevel];

  const detail: ClientDetailState = {
    user: {
      user_id: spec.id,
      email: spec.email,
      first_name: spec.firstName,
      last_name: spec.lastName,
      display_name: `${spec.firstName} ${spec.lastName}`,
      phone_number: spec.phone,
      resident_country: spec.country,
      resident_state: null,
      city: spec.city,
      date_of_birth: `${birthYear}-04-12`,
      currency: spec.currency,
      occupation: spec.occupation,
      marital_status: spec.maritalStatus,
      gender: spec.gender,
      prefix: null,
      dependents: spec.dependents?.length ?? 0,
      citizenships: spec.citizenships,
      risk_profile: spec.riskLevel,
      account_mode: spec.residency,
      bio: spec.bio,
      is_active: spec.status !== "inactive",
      user_type: "user",
      created_at: joinedAt,
      updated_at: daysFromNow(-spec.lastContactDaysAgo),
    },
    riskAssessment: {
      assessment_id: `risk-${spec.id}`,
      questionnaire_version: "v3",
      responses: { horizon: 4, drawdown: 3, liquidity: 3, experience: 4 },
      profile_snapshot: { band: spec.riskLevel },
      scoring: {
        time_horizon_avg: 4,
        questionnaire_score: 68,
        modifiers: { concentration: -2, liquidity: 1 },
        modifier_total: -1,
        final_score: 67,
      },
      result: {
        risk_band: spec.riskLevel,
        description: bandCopy.description,
        strategy: bandCopy.strategy,
      },
      is_recalculation: false,
      created_at: daysFromNow(-spec.joinedDaysAgo + 5),
    },
    incomeRows: spec.income.map((row, index) => ({
      id: `${spec.id}-income-${index}`,
      name: row.name,
      amount: row.amount,
      isRecurring: true,
      recurringType: "monthly",
      startDate: joinedAt,
      endDate: null,
    })),
    expenseCategories: spec.expenses.map((row, index) => ({
      id: `${spec.id}-expense-${index}`,
      name: row.name,
      amount: row.amount,
      essential: row.essential ?? false,
      isRecurring: true,
      recurringType: "monthly",
      startDate: joinedAt,
    })),
    goals: spec.goals.map((goal, index) => ({
      id: `${spec.id}-goal-${index}`,
      userId: spec.id,
      title: goal.title,
      category: goal.category,
      priority: goal.priority,
      description: `${goal.category} goal tracked in the client plan.`,
      yearsRemaining: goal.years,
      current: goal.current,
      target: goal.target,
      monthlyContribution: goal.monthly,
      status: goal.status ?? "active",
    })),
    goalsMeta: {
      totalMonthlyNeeded: sum(spec.goals.map((goal) => goal.monthly)),
      totalGoals: spec.goals.length,
      completedGoals: spec.goals.filter((goal) => goal.status === "completed")
        .length,
      activeGoals: spec.goals.filter((goal) => goal.status !== "completed")
        .length,
    },
    holdings: spec.holdings.map((holding, index) => ({
      holding_id: `${spec.id}-holding-${index}`,
      name: holding.name,
      symbol: holding.symbol,
      asset_type: holding.assetType,
      quantity: holding.quantity ?? undefined,
      cost_basis: holding.costBasis,
      current_value: holding.value,
    })),
    accounts: spec.accounts.map((account, index) => ({
      id: `${spec.id}-account-${index}`,
      name: account.name,
      institution: account.institution,
      type: account.type,
      balance: account.balance,
      currency: spec.currency,
      updatedAt: daysFromNow(-2),
    })),
    propertyAssets: (spec.properties ?? []).map((property, index) => ({
      property_id: `${spec.id}-property-${index}`,
      name: property.name,
      property_type: property.type,
      country: property.country,
      city: property.city,
      purchase_price: property.purchase,
      current_value: property.current,
    })),
    liabilities: (spec.liabilities ?? []).map((liability, index) => ({
      id: `${spec.id}-liability-${index}`,
      name: liability.name,
      lender: liability.lender,
      type: liability.type,
      balance: liability.balance,
      interestRatePct: liability.ratePct,
      minPaymentMonthly: liability.monthly,
    })),
    insurancePolicies: (spec.insurance ?? []).map((policy, index) => ({
      policy_id: `${spec.id}-policy-${index}`,
      category: policy.category,
      provider: policy.provider,
      name: policy.name,
      policy_number: `POL-${spec.id.toUpperCase()}-${index + 1}`,
      coverage_amount: policy.coverage,
      premium_monthly: policy.premium,
    })),
    retirement: {
      currentAge: spec.age,
      retirementAge,
      lifeExpectancy: 88,
      currentInvested: holdingsValue,
      monthlySavings: Math.max(0, round(monthlySurplus * 0.55)),
      existingPensionBalance: round(holdingsValue * 0.18),
      monthlyPensionContribution: round(monthlyIncome * 0.08),
      expectedReturnPct: 7.5,
      inflationPct: 3.2,
      safeWithdrawalRatePct: 4,
      desiredMonthlyIncome:
        spec.desiredMonthlyIncome ?? round(monthlyExpenses * 0.85),
    },
    emergencyFund: {
      targetMonths: emergencyTargetMonths,
      currentCashBalance: cashBalance,
      storageLocation: spec.accounts[0]?.institution ?? "Cash account",
      computed: {
        monthsCovered:
          monthlyExpenses > 0
            ? Math.round((cashBalance / monthlyExpenses) * 10) / 10
            : 0,
        gap: round(emergencyGap),
      },
    },
    cashFlowHistory: buildCashFlowHistory(monthlyIncome, monthlyExpenses),
    cashFlowSummary: {
      monthly_income: monthlyIncome,
      monthly_expenses: monthlyExpenses,
      monthly_surplus: monthlySurplus,
      savings_rate_pct:
        monthlyIncome > 0
          ? Math.round((monthlySurplus / monthlyIncome) * 100)
          : 0,
      currency: spec.currency,
    },
    portfolioPerformance: buildPerformance(aua, spec.performanceYtdPct),
    allocation: buildAllocation(spec.holdings, cashBalance),
    taxProfile: {
      effectiveTaxRatePct: spec.effectiveTaxRatePct ?? 24,
      marginalTaxRatePct: spec.marginalTaxRatePct ?? 40,
      filingStatus: spec.maritalStatus === "married" ? "Joint" : "Individual",
      stateOrRegion: spec.country,
      updatedAt: daysFromNow(-45),
    },
    dependents: (spec.dependents ?? []).map((dependent, index) => ({
      id: `${spec.id}-dependent-${index}`,
      name: dependent.name,
      relationship: dependent.relationship,
      dateOfBirth: `${new Date().getFullYear() - dependent.ageYears}-06-01`,
      financialReliance: dependent.reliance ?? "full",
    })),
    freshness: [
      { section: "Profile", updatedAt: daysFromNow(-12) },
      { section: "Portfolio", updatedAt: daysFromNow(-1) },
      { section: "Goals", updatedAt: daysFromNow(-30) },
      { section: "Risk", updatedAt: daysFromNow(-spec.joinedDaysAgo + 5) },
      { section: "Cash flow", updatedAt: daysFromNow(-20) },
    ],
    profileCompletionScore: Math.min(
      100,
      55 +
        spec.goals.length * 6 +
        (spec.properties?.length ?? 0) * 4 +
        (spec.insurance?.length ?? 0) * 4,
    ),
  };

  return {
    client,
    detail,
    subscription: spec.subscription,
    segment: spec.segment,
    idleCashPct,
    targetCashPct: spec.targetCashPct,
    heldAwayUsd: spec.heldAwayUsd ?? 0,
    portfolioDriftPct: spec.portfolioDriftPct,
    revenueQtdUsd: spec.revenueQtdUsd,
    netFlowQtdUsd: spec.netFlowQtdUsd,
    performanceYtdPct: spec.performanceYtdPct,
    lastEngagementDays: spec.lastContactDaysAgo,
    maturingInvestment: spec.maturingInvestment
      ? {
          name: spec.maturingInvestment.name,
          valueUsd: spec.maturingInvestment.valueUsd,
          maturesAt: daysFromNow(spec.maturingInvestment.maturesInDays),
        }
      : null,
  };
}
