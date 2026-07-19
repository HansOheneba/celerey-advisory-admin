import type { ClientSubscription, RiskLevel } from "@/types/client";

export type ClientDetailUser = {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  phone_number: string;
  resident_country: string;
  resident_state: string;
  city: string;
  date_of_birth: string;
  currency: string;
  occupation: string;
  marital_status: string;
  gender: string;
  prefix: string;
  dependents: number;
  citizenships: string[];
  risk_profile: RiskLevel | string;
  account_mode: string;
  bio: string;
  is_active: boolean;
  user_type: string;
  created_at: string;
  updated_at: string;
};

export type CashFlowSummary = {
  monthly_income: number;
  monthly_expenses: number;
  monthly_surplus: number;
  savings_rate_pct: number;
  currency: string;
};

export type ClientDetailState = {
  user: ClientDetailUser;
  riskAssessment: {
    assessment_id: string;
    questionnaire_version: string;
    responses: Record<string, number>;
    profile_snapshot: Record<string, unknown>;
    scoring: {
      time_horizon_avg: number;
      questionnaire_score: number;
      modifiers: Record<string, number>;
      modifier_total: number;
      final_score: number;
    };
    result: {
      risk_band: string;
      description: string;
      strategy: string;
    };
    is_recalculation: boolean;
    created_at: string;
  };
  incomeRows: Array<{
    id: string;
    name: string;
    amount: number;
    isRecurring: boolean;
    recurringType: string;
    startDate: string;
    endDate: string | null;
  }>;
  expenseCategories: Array<{
    id: string;
    name: string;
    amount: number;
    essential: boolean;
    isRecurring: boolean;
    recurringType: string;
    startDate: string;
  }>;
  goals: Array<{
    id: string;
    userId: string;
    title: string;
    category: string;
    priority: string | number;
    description: string;
    yearsRemaining?: number;
    current: number;
    target?: number;
    monthlyContribution?: number;
    status?: string;
    [key: string]: unknown;
  }>;
  goalsMeta: {
    totalMonthlyNeeded: number;
    totalGoals: number;
    completedGoals: number;
    activeGoals: number;
  };
  holdings: Array<{
    holding_id: string;
    name: string;
    symbol?: string;
    asset_type: string;
    quantity?: number;
    cost_basis?: number;
    current_value?: number;
    [key: string]: unknown;
  }>;
  accounts: Array<{
    id: string;
    name: string;
    institution: string;
    type: string;
    balance: number;
    currency: string;
    updatedAt: string;
  }>;
  propertyAssets: Array<{
    property_id: string;
    name: string;
    property_type: string;
    country: string;
    city: string;
    purchase_price?: number;
    current_value?: number;
    [key: string]: unknown;
  }>;
  liabilities: Array<{
    id: string;
    name: string;
    lender: string;
    type: string;
    balance: number;
    interestRatePct?: number;
    minPaymentMonthly?: number;
    [key: string]: unknown;
  }>;
  insurancePolicies: Array<{
    policy_id: string;
    category: string;
    provider: string;
    name: string;
    policy_number?: string;
    coverage_amount?: number;
    premium_monthly?: number;
    [key: string]: unknown;
  }>;
  retirement: {
    currentAge: number;
    retirementAge: number;
    lifeExpectancy: number;
    currentInvested: number;
    monthlySavings: number;
    existingPensionBalance: number;
    monthlyPensionContribution: number;
    expectedReturnPct: number;
    inflationPct: number;
    safeWithdrawalRatePct: number;
    desiredMonthlyIncome: number;
    [key: string]: unknown;
  };
  emergencyFund: {
    targetMonths: number;
    currentCashBalance: number;
    storageLocation?: string;
    computed?: {
      monthsCovered?: number;
      gap?: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  cashFlowHistory: Array<{
    month: string;
    income: number;
    expenses: number;
    surplus: number;
  }>;
  cashFlowSummary: CashFlowSummary;
  portfolioPerformance: Array<{
    month: string;
    value: number;
    contributions: number;
  }>;
  allocation: Array<{
    label: string;
    percentage: number;
    value: number;
  }>;
  taxProfile: {
    effectiveTaxRatePct: number;
    marginalTaxRatePct: number;
    filingStatus: string;
    stateOrRegion: string;
    updatedAt: string;
  };
  dependents: Array<{
    id: string;
    name: string;
    relationship: string;
    dateOfBirth: string;
    financialReliance?: string;
    notes?: string;
  }>;
  freshness: Array<{
    section: string;
    updatedAt: string;
  }>;
  profileCompletionScore: number;
};

export type ClientDetail = {
  id: string;
  subscription: ClientSubscription;
  state: ClientDetailState;
};
