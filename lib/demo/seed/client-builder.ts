import {
  classifyAccountRelationship,
  classifyHoldingRelationship,
  computeAssetTotalsFromPools,
  type AssetRelationship,
} from "@/lib/clients/asset-relationship";
import { reviewFrequencyForSegment } from "@/lib/clients/contact-tracking";
import { applyAssetMandate, type AssetMandate } from "@/lib/demo/seed/asset-mandate";
import type {
  Client,
  ClientStatus,
  ClientSubscription,
  RiskLevel,
} from "@/types/client";
import type { ClientDetailState } from "@/types/client-detail";
import { sortInternalNotesNewestFirst } from "@/lib/clients/internal-notes";
import type { ClientSegment, DemoClientRecord } from "@/lib/demo/types";
import type { ClientInternalNote } from "@/types/client-internal-note";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Seed dates are relative to seed time so the demo always looks current. */
export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

/** Same as daysFromNow but pins a local wall-clock time (for calendar-visible slots). */
export function daysFromNowAtTime(
  days: number,
  hour: number,
  minute = 0,
): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
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
  relationship?: AssetRelationship;
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
  targetDate?: string;
  icon?: string;
  color?: string;
  probability?: number;
};

export type AccountSpec = {
  name: string;
  institution: string;
  type: string;
  balance: number;
  relationship?: AssetRelationship;
};

export type PropertyMortgageSpec = {
  lender: string;
  balance: number;
  interestRatePct: number;
  minPaymentMonthly: number;
  termYears?: number;
  startDate?: string;
  originalLoanAmount?: number;
};

export type PropertyInsuranceSpec = {
  type: string;
  provider: string;
  policyNumber?: string;
  coverageAmount?: number;
  annualPremium?: number;
  expiryDate?: string;
};

export type PropertySpec = {
  name: string;
  type: string;
  country: string;
  city: string;
  purchase: number;
  current: number;
  purchaseDate?: string;
  isPrimary?: boolean;
  mortgage?: PropertyMortgageSpec;
  insurance?: PropertyInsuranceSpec[];
};

export type LiabilitySpec = {
  name: string;
  lender: string;
  type: string;
  balance: number;
  ratePct: number;
  monthly: number;
  dueDay?: number;
  originalLoanAmount?: number;
};

export type InsuranceSpec = {
  category: string;
  provider: string;
  name: string;
  coverage: number;
  premium: number;
  policyNumber?: string;
  startDate?: string;
  renewalDate?: string;
  deductible?: number;
  beneficiary?: string;
  notes?: string;
  autoRenew?: boolean;
};

export type MoneySpec = {
  name: string;
  amount: number;
  essential?: boolean;
  category?: string;
};

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
  /** Ghana region code from COUNTRY_STATES.GH (e.g. AA, AH). */
  regionCode?: string;
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
  retirementStorage?: string;
  desiredMonthlyIncome?: number;
  emergencyTargetMonths?: number;
  maturingInvestment?: {
    name: string;
    valueUsd: number;
    maturesInDays: number;
  } | null;
  effectiveTaxRatePct?: number;
  marginalTaxRatePct?: number;
  /** How assets split between AUA and AUM in the demo book. */
  assetMandate?: AssetMandate;
  preferredContact?: string;
  investmentCurrency?: string;
  prefix?: string | null;
  /** Reference personas ship fully populated — skip auto-enrich. */
  skipEnrich?: boolean;
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

function goalTargetDate(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + Math.ceil(years));
  date.setMonth(11, 31);
  return date.toISOString().slice(0, 10);
}

function attachMortgagesToProperties(
  properties: PropertySpec[],
  liabilities: LiabilitySpec[],
): { properties: PropertySpec[]; liabilities: LiabilitySpec[] } {
  const mortgages = liabilities.filter((row) => row.type === "mortgage");
  const standalone = liabilities.filter((row) => row.type !== "mortgage");
  const nextProperties = properties.map((property) => ({ ...property }));

  for (const mortgage of mortgages) {
    const target =
      nextProperties.find((property) => !property.mortgage) ?? nextProperties[0];
    if (!target) {
      standalone.push(mortgage);
      continue;
    }
    target.mortgage = {
      lender: mortgage.lender,
      balance: mortgage.balance,
      interestRatePct: mortgage.ratePct,
      minPaymentMonthly: mortgage.monthly,
      originalLoanAmount: mortgage.originalLoanAmount,
    };
  }

  return { properties: nextProperties, liabilities: standalone };
}

function buildRetirementProjections(
  retirement: ClientDetailState["retirement"],
  monthlySurplus: number,
) {
  const yearsToRetirement = Math.max(
    1,
    retirement.retirementAge - retirement.currentAge,
  );
  const projectedBalanceAtRetirement = round(
    retirement.currentInvested * Math.pow(1 + retirement.expectedReturnPct / 100, yearsToRetirement) +
      retirement.monthlySavings * 12 * yearsToRetirement * 1.4,
  );
  const desiredAnnual = retirement.desiredMonthlyIncome * 12;
  const projectedIncome = round(
    (projectedBalanceAtRetirement * retirement.safeWithdrawalRatePct) / 100 / 12,
  );
  const shortfallMonthly = Math.max(0, retirement.desiredMonthlyIncome - projectedIncome);

  return {
    projectedBalanceAtRetirement,
    monthlyIncomeAtRetirement: projectedIncome,
    onTrack: shortfallMonthly === 0,
    shortfallMonthly,
    surplusFromPlan: monthlySurplus,
  };
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

type SeedNoteExtra = {
  body: string;
  authorId?: string;
  authorName?: string;
  daysBeforeLastContact: number;
};

const EXTRA_INTERNAL_NOTES: Record<string, SeedNoteExtra[]> = {
  "osei-bonsu": [
    {
      body: "Prefers written summaries before any call. PA handles calendar.",
      daysBeforeLastContact: 12,
    },
  ],
  "ada-mensah": [
    {
      body: "Wants WhatsApp for quick checks. Do not text after 8pm Accra time.",
      daysBeforeLastContact: 18,
    },
    {
      body: "2026 review: asked to model home deposit vs pension top-up before she commits.",
      daysBeforeLastContact: 45,
    },
  ],
  darko: [
    {
      body: "Copy spouse on any equity sleeve changes.",
      daysBeforeLastContact: 28,
    },
  ],
};

function buildSeedInternalNotes(spec: ClientSpec): ClientInternalNote[] {
  const notes: ClientInternalNote[] = [];

  if (spec.notes?.trim()) {
    notes.push({
      id: `${spec.id}-note-1`,
      body: spec.notes.trim(),
      authorId: spec.advisorId,
      authorName: spec.advisorName,
      createdAt: daysFromNow(-spec.lastContactDaysAgo),
    });
  }

  const extras = EXTRA_INTERNAL_NOTES[spec.id];
  if (extras) {
    for (const [index, extra] of extras.entries()) {
      notes.push({
        id: `${spec.id}-note-extra-${index + 1}`,
        body: extra.body,
        authorId: extra.authorId ?? spec.advisorId,
        authorName: extra.authorName ?? spec.advisorName,
        createdAt: daysFromNow(
          -spec.lastContactDaysAgo - extra.daysBeforeLastContact,
        ),
      });
    }
  } else if (spec.notes?.trim() && spec.segment !== "emerging") {
    notes.push({
      id: `${spec.id}-note-2`,
      body: "Confirm preferred channel before sending portfolio commentary.",
      authorId: spec.advisorId,
      authorName: spec.advisorName,
      createdAt: daysFromNow(-spec.lastContactDaysAgo - 14),
    });
  }

  return sortInternalNotesNewestFirst(notes);
}

export function buildClientRecord(spec: ClientSpec): DemoClientRecord {
  const resolved = applyAssetMandate(spec);
  const holdingsValue = sum(resolved.holdings.map((holding) => holding.value));
  const cashBalance = sum(resolved.accounts.map((account) => account.balance));
  const heldAwayUsd = resolved.heldAwayUsd ?? 0;

  const assetPools = [
    ...resolved.holdings.map((holding) => ({
      value: holding.value,
      relationship: classifyHoldingRelationship(holding.relationship),
    })),
    ...resolved.accounts.map((account) => ({
      value: account.balance,
      relationship: classifyAccountRelationship(
        account.institution,
        account.relationship,
      ),
    })),
  ];
  const assetTotals = computeAssetTotalsFromPools(assetPools, heldAwayUsd);

  const monthlyIncome = sum(resolved.income.map((row) => row.amount));
  const monthlyExpenses = sum(resolved.expenses.map((row) => row.amount));
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const reviewFrequencyDays = reviewFrequencyForSegment(spec.segment);
  const lastContactAt = daysFromNow(-spec.lastContactDaysAgo);
  const idleCashPct =
    assetTotals.aua > 0
      ? Math.round((cashBalance / assetTotals.aua) * 1000) / 10
      : 0;
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
    aua: assetTotals.aua,
    aum: assetTotals.aum,
    currency: spec.currency,
    advisorId: spec.advisorId,
    advisorName: spec.advisorName,
    location: spec.location,
    lastContactAt,
    lastContactSource: "seed",
    reviewFrequencyDays,
    nextReviewAt: daysFromNow(spec.nextReviewInDays),
    joinedAt,
    goalsCount: spec.goals.length,
  };

  const internalNotes = buildSeedInternalNotes(spec);

  const birthYear = new Date().getFullYear() - spec.age;
  const bandCopy = RISK_BAND_COPY[spec.riskLevel];
  const propertyBundle = attachMortgagesToProperties(
    spec.properties ?? [],
    spec.liabilities ?? [],
  );
  const updatedAt = daysFromNow(-spec.lastContactDaysAgo);
  const targetAmount = monthlyExpenses * emergencyTargetMonths;
  const runwayMonths =
    monthlyExpenses > 0
      ? Math.round((cashBalance / monthlyExpenses) * 10) / 10
      : 0;
  const fundedPct =
    targetAmount > 0 ? Math.round((cashBalance / targetAmount) * 100) : 0;

  const retirementBase = {
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
    storageLocation: spec.retirementStorage ?? "employer_pension",
  };

  const detail: ClientDetailState = {
    user: {
      user_id: spec.id,
      email: spec.email,
      first_name: spec.firstName,
      last_name: spec.lastName,
      display_name: `${spec.firstName} ${spec.lastName}`,
      phone_number: spec.phone,
      resident_country: spec.country,
      resident_state: spec.regionCode ?? null,
      city: spec.city,
      date_of_birth: `${birthYear}-04-12`,
      currency: spec.currency,
      investment_currency: spec.investmentCurrency ?? spec.currency,
      preferred_contact: spec.preferredContact ?? "email",
      occupation: spec.occupation,
      marital_status: spec.maritalStatus,
      gender: spec.gender,
      prefix: spec.prefix ?? null,
      dependents: spec.dependents?.length ?? 0,
      citizenships: spec.citizenships,
      risk_profile: spec.riskLevel,
      account_mode: spec.residency,
      bio: spec.bio,
      is_active: spec.status !== "inactive",
      user_type: "user",
      created_at: joinedAt,
      updated_at: updatedAt,
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
      category: row.category ?? row.name,
      isRecurring: true,
      recurringType: "monthly",
      startDate: joinedAt.slice(0, 10),
      endDate: null,
    })),
    expenseCategories: spec.expenses.map((row, index) => ({
      id: `${spec.id}-expense-${index}`,
      name: row.name,
      amount: row.amount,
      category: row.category ?? row.name,
      essential: row.essential ?? false,
      isRecurring: true,
      recurringType: "monthly",
      startDate: joinedAt.slice(0, 10),
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
      targetDate: goal.targetDate ?? goalTargetDate(goal.years),
      monthlyContribution: goal.monthly,
      monthlyContributionNeeded: goal.monthly,
      status: goal.status ?? "active",
      icon: goal.icon,
      color: goal.color,
      probability: goal.probability,
      completed: goal.status === "completed",
    })),
    goalsMeta: {
      totalMonthlyNeeded: sum(spec.goals.map((goal) => goal.monthly)),
      totalGoals: spec.goals.length,
      completedGoals: spec.goals.filter((goal) => goal.status === "completed")
        .length,
      activeGoals: spec.goals.filter((goal) => goal.status !== "completed")
        .length,
    },
    holdings: resolved.holdings.map((holding, index) => ({
      holding_id: `${spec.id}-holding-${index}`,
      name: holding.name,
      symbol: holding.symbol,
      asset_type: holding.assetType,
      valuation_method: holding.symbol ? "market" : "manual",
      quantity: holding.quantity ?? undefined,
      cost_basis: holding.costBasis,
      current_value: holding.value,
      initial_value: holding.costBasis,
      initial_value_date: joinedAt.slice(0, 10),
      last_updated: updatedAt,
      is_active: true,
      relationship: classifyHoldingRelationship(holding.relationship),
    })),
    accounts: resolved.accounts.map((account, index) => ({
      id: `${spec.id}-account-${index}`,
      name: account.name,
      institution: account.institution,
      type: account.type,
      balance: account.balance,
      currency: spec.currency,
      updatedAt: daysFromNow(-2),
      relationship: classifyAccountRelationship(
        account.institution,
        account.relationship,
      ),
    })),
    propertyAssets: propertyBundle.properties.map((property, index) => ({
      property_id: `${spec.id}-property-${index}`,
      name: property.name,
      property_type: property.type,
      country: property.country,
      city: property.city,
      purchase_date: property.purchaseDate ?? joinedAt.slice(0, 10),
      purchase_price: property.purchase,
      market_value: property.current,
      current_value: property.current,
      mortgage_balance: property.mortgage?.balance ?? 0,
      is_primary: property.isPrimary ?? index === 0,
      is_active: true,
      mortgage: property.mortgage
        ? {
            lender: property.mortgage.lender,
            balance: property.mortgage.balance,
            interest_rate_pct: property.mortgage.interestRatePct,
            min_payment_monthly: property.mortgage.minPaymentMonthly,
            term_years: property.mortgage.termYears,
            start_date: property.mortgage.startDate,
            original_loan_amount: property.mortgage.originalLoanAmount,
            type: "repayment",
          }
        : undefined,
      insurance: property.insurance,
    })),
    liabilities: propertyBundle.liabilities.map((liability, index) => ({
      id: `${spec.id}-liability-${index}`,
      name: liability.name,
      lender: liability.lender,
      type: liability.type,
      balance: liability.balance,
      interestRatePct: liability.ratePct,
      minPaymentMonthly: liability.monthly,
      dueDay: liability.dueDay,
      originalLoanAmount: liability.originalLoanAmount,
      updatedAt,
    })),
    insurancePolicies: (spec.insurance ?? []).map((policy, index) => ({
      policy_id: `${spec.id}-policy-${index}`,
      category: policy.category,
      provider: policy.provider,
      name: policy.name,
      policy_number:
        policy.policyNumber ?? `POL-${spec.id.toUpperCase()}-${index + 1}`,
      coverage_amount: policy.coverage,
      premium_monthly: policy.premium,
      deductible: policy.deductible,
      start_date: policy.startDate,
      renewal_date: policy.renewalDate,
      auto_renew: policy.autoRenew ?? true,
      beneficiary: policy.beneficiary,
      notes: policy.notes,
      is_active: true,
    })),
    retirement: retirementBase,
    retirementProjections: buildRetirementProjections(
      retirementBase,
      monthlySurplus,
    ),
    emergencyFund: {
      targetMonths: emergencyTargetMonths,
      currentCashBalance: cashBalance,
      storageLocation: resolved.accounts[0]?.institution ?? "savings_account",
      updatedAt,
      computed: {
        monthlyBaseline: monthlyExpenses,
        targetAmount: round(targetAmount),
        runwayMonths,
        monthsCovered: runwayMonths,
        fundedPct,
        shortfall: round(emergencyGap),
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
    portfolioPerformance: buildPerformance(
      assetTotals.aum > 0 ? assetTotals.aum : assetTotals.aua,
      spec.performanceYtdPct,
    ),
    allocation: buildAllocation(resolved.holdings, cashBalance),
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
      { section: "income", updatedAt },
      { section: "expenses", updatedAt },
      { section: "goals", updatedAt: daysFromNow(-30) },
      { section: "assets", updatedAt: daysFromNow(-1) },
      { section: "properties", updatedAt: daysFromNow(-45) },
      { section: "insurance", updatedAt: daysFromNow(-60) },
      { section: "retirement", updatedAt: daysFromNow(-90) },
      { section: "liabilities", updatedAt: daysFromNow(-20) },
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
    internalNotes,
    subscription: spec.subscription,
    segment: spec.segment,
    idleCashPct,
    targetCashPct: spec.targetCashPct,
    heldAwayUsd,
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
