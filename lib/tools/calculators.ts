/**
 * Deterministic planning maths shared by the Tools page. Kept free of React so
 * the same functions can back a server-rendered report later.
 */

export type RetirementProjection = {
  projectedPotUsd: number;
  requiredPotUsd: number;
  gapUsd: number;
  sustainableMonthlyIncomeUsd: number;
  additionalMonthlySavingsUsd: number;
};

export function projectRetirement(input: {
  currentAge: number;
  retirementAge: number;
  currentSavingsUsd: number;
  monthlyContributionUsd: number;
  expectedReturnPct: number;
  desiredMonthlyIncomeUsd: number;
  safeWithdrawalRatePct: number;
}): RetirementProjection {
  const years = Math.max(input.retirementAge - input.currentAge, 0);
  const monthlyRate = input.expectedReturnPct / 100 / 12;
  const months = years * 12;

  const grownSavings =
    input.currentSavingsUsd * Math.pow(1 + monthlyRate, months);

  const grownContributions =
    monthlyRate === 0
      ? input.monthlyContributionUsd * months
      : input.monthlyContributionUsd *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  const projectedPotUsd = grownSavings + grownContributions;

  const withdrawalRate = input.safeWithdrawalRatePct / 100;
  const requiredPotUsd =
    withdrawalRate > 0
      ? (input.desiredMonthlyIncomeUsd * 12) / withdrawalRate
      : 0;

  const gapUsd = requiredPotUsd - projectedPotUsd;

  const additionalMonthlySavingsUsd =
    gapUsd <= 0 || months === 0
      ? 0
      : monthlyRate === 0
        ? gapUsd / months
        : gapUsd / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  return {
    projectedPotUsd,
    requiredPotUsd,
    gapUsd,
    sustainableMonthlyIncomeUsd: (projectedPotUsd * withdrawalRate) / 12,
    additionalMonthlySavingsUsd,
  };
}

export type GoalFunding = {
  projectedUsd: number;
  shortfallUsd: number;
  requiredMonthlyUsd: number;
  fundedPct: number;
};

export function projectGoalFunding(input: {
  targetUsd: number;
  currentUsd: number;
  monthlyContributionUsd: number;
  years: number;
  expectedReturnPct: number;
}): GoalFunding {
  const monthlyRate = input.expectedReturnPct / 100 / 12;
  const months = Math.max(input.years, 0) * 12;

  const grown = input.currentUsd * Math.pow(1 + monthlyRate, months);
  const contributions =
    monthlyRate === 0
      ? input.monthlyContributionUsd * months
      : input.monthlyContributionUsd *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  const projectedUsd = grown + contributions;
  const shortfallUsd = Math.max(input.targetUsd - projectedUsd, 0);

  const requiredMonthlyUsd =
    months === 0
      ? 0
      : monthlyRate === 0
        ? Math.max(input.targetUsd - input.currentUsd, 0) / months
        : Math.max(input.targetUsd - grown, 0) /
          ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  return {
    projectedUsd,
    shortfallUsd,
    requiredMonthlyUsd,
    fundedPct:
      input.targetUsd > 0 ? (projectedUsd / input.targetUsd) * 100 : 100,
  };
}

export type CashDeploymentImpact = {
  deployableUsd: number;
  incrementalAnnualReturnUsd: number;
  fiveYearValueUsd: number;
  opportunityCostUsd: number;
};

export function modelCashDeployment(input: {
  portfolioValueUsd: number;
  cashWeightingPct: number;
  targetCashWeightingPct: number;
  depositRatePct: number;
  expectedReturnPct: number;
}): CashDeploymentImpact {
  const excessPct = Math.max(
    input.cashWeightingPct - input.targetCashWeightingPct,
    0,
  );
  const deployableUsd = (input.portfolioValueUsd * excessPct) / 100;
  const spread = (input.expectedReturnPct - input.depositRatePct) / 100;

  const fiveYearDeployed =
    deployableUsd * Math.pow(1 + input.expectedReturnPct / 100, 5);
  const fiveYearHeld =
    deployableUsd * Math.pow(1 + input.depositRatePct / 100, 5);

  return {
    deployableUsd,
    incrementalAnnualReturnUsd: deployableUsd * spread,
    fiveYearValueUsd: fiveYearDeployed,
    opportunityCostUsd: fiveYearDeployed - fiveYearHeld,
  };
}

export type LendingCapacity = {
  eligibleCollateralUsd: number;
  maximumFacilityUsd: number;
  annualInterestUsd: number;
  headroomUsd: number;
};

export function modelLendingCapacity(input: {
  portfolioValueUsd: number;
  advanceRatePct: number;
  existingBorrowingUsd: number;
  interestRatePct: number;
}): LendingCapacity {
  const maximumFacilityUsd =
    (input.portfolioValueUsd * input.advanceRatePct) / 100;
  const headroomUsd = Math.max(
    maximumFacilityUsd - input.existingBorrowingUsd,
    0,
  );

  return {
    eligibleCollateralUsd: input.portfolioValueUsd,
    maximumFacilityUsd,
    annualInterestUsd: (headroomUsd * input.interestRatePct) / 100,
    headroomUsd,
  };
}

export type FxExposureResult = {
  annualGhsExpensesUsd: number;
  postShockAnnualCostUsd: number;
  additionalUsdNeeded: number;
  hedgeNotionalUsd: number;
};

export function modelFxExposure(input: {
  usdPortfolioUsd: number;
  monthlyGhsExpenses: number;
  usdGhsRate: number;
  fxShockPct: number;
}): FxExposureResult {
  const annualGhsExpenses = input.monthlyGhsExpenses * 12;
  const annualGhsExpensesUsd =
    input.usdGhsRate > 0 ? annualGhsExpenses / input.usdGhsRate : 0;
  const shockedRate = input.usdGhsRate * (1 + input.fxShockPct / 100);
  const postShockAnnualCostUsd =
    shockedRate > 0 ? annualGhsExpenses / shockedRate : 0;
  const additionalUsdNeeded = Math.max(
    postShockAnnualCostUsd - annualGhsExpensesUsd,
    0,
  );

  return {
    annualGhsExpensesUsd,
    postShockAnnualCostUsd,
    additionalUsdNeeded,
    hedgeNotionalUsd: additionalUsdNeeded * 0.8,
  };
}

export type TbillLadderResult = {
  weightedYieldPct: number;
  projectedValueUsd: number;
  depositAlternativeUsd: number;
  upliftUsd: number;
};

export function modelTbillLadder(input: {
  principalUsd: number;
  allocation91Pct: number;
  allocation182Pct: number;
  allocation364Pct: number;
  yield91Pct: number;
  yield182Pct: number;
  yield364Pct: number;
  depositRatePct: number;
  months: number;
}): TbillLadderResult {
  const w91 = input.allocation91Pct / 100;
  const w182 = input.allocation182Pct / 100;
  const w364 = input.allocation364Pct / 100;
  const weightedYieldPct =
    w91 * input.yield91Pct +
    w182 * input.yield182Pct +
    w364 * input.yield364Pct;
  const years = input.months / 12;
  const projectedValueUsd =
    input.principalUsd * Math.pow(1 + weightedYieldPct / 100, years);
  const depositAlternativeUsd =
    input.principalUsd * Math.pow(1 + input.depositRatePct / 100, years);

  return {
    weightedYieldPct,
    projectedValueUsd,
    depositAlternativeUsd,
    upliftUsd: projectedValueUsd - depositAlternativeUsd,
  };
}

export type EducationFundingResult = GoalFunding & {
  projectedFeesAtEnrollment: number;
};

export function projectEducationFunding(input: {
  childAge: number;
  enrollmentAge: number;
  annualFeesToday: number;
  feeInflationPct: number;
  currentFundUsd: number;
  monthlyContributionUsd: number;
  expectedReturnPct: number;
}): EducationFundingResult {
  const years = Math.max(input.enrollmentAge - input.childAge, 0);
  const projectedFeesAtEnrollment =
    input.annualFeesToday * Math.pow(1 + input.feeInflationPct / 100, years);

  const base = projectGoalFunding({
    targetUsd: projectedFeesAtEnrollment,
    currentUsd: input.currentFundUsd,
    monthlyContributionUsd: input.monthlyContributionUsd,
    years,
    expectedReturnPct: input.expectedReturnPct,
  });

  return { ...base, projectedFeesAtEnrollment };
}

export type PropertyEquityResult = {
  grossEquityUsd: number;
  netEquityUsd: number;
  maxBorrowAgainstPropertyUsd: number;
  securitiesHeadroomUsd: number;
  totalBorrowingCapacityUsd: number;
};

export function modelPropertyEquity(input: {
  propertyValueUsd: number;
  mortgageBalanceUsd: number;
  maxLtvPct: number;
  portfolioValueUsd: number;
  advanceRatePct: number;
  existingBorrowingUsd: number;
}): PropertyEquityResult {
  const grossEquityUsd = Math.max(
    input.propertyValueUsd - input.mortgageBalanceUsd,
    0,
  );
  const maxBorrowAgainstPropertyUsd =
    (input.propertyValueUsd * input.maxLtvPct) / 100 -
    input.mortgageBalanceUsd;
  const netEquityUsd = Math.max(maxBorrowAgainstPropertyUsd, 0);
  const securitiesHeadroomUsd = modelLendingCapacity({
    portfolioValueUsd: input.portfolioValueUsd,
    advanceRatePct: input.advanceRatePct,
    existingBorrowingUsd: input.existingBorrowingUsd,
    interestRatePct: 0,
  }).headroomUsd;

  return {
    grossEquityUsd,
    netEquityUsd,
    maxBorrowAgainstPropertyUsd: netEquityUsd,
    securitiesHeadroomUsd,
    totalBorrowingCapacityUsd: netEquityUsd + securitiesHeadroomUsd,
  };
}

export type EmergencyFundResult = {
  monthsCovered: number;
  targetBalanceUsd: number;
  gapUsd: number;
  isAdequate: boolean;
};

export function assessEmergencyFund(input: {
  monthlyEssentialExpensesUsd: number;
  liquidBalanceUsd: number;
  targetMonths: number;
}): EmergencyFundResult {
  const targetBalanceUsd =
    input.monthlyEssentialExpensesUsd * input.targetMonths;
  const monthsCovered =
    input.monthlyEssentialExpensesUsd > 0
      ? input.liquidBalanceUsd / input.monthlyEssentialExpensesUsd
      : 0;
  const gapUsd = Math.max(targetBalanceUsd - input.liquidBalanceUsd, 0);

  return {
    monthsCovered,
    targetBalanceUsd,
    gapUsd,
    isAdequate: gapUsd <= 0,
  };
}

export type RebalanceImpactResult = {
  tradeValueUsd: number;
  estimatedCostUsd: number;
  driftBeforePct: number;
  driftAfterPct: number;
};

export function modelRebalanceImpact(input: {
  portfolioValueUsd: number;
  currentEquityPct: number;
  targetEquityPct: number;
  transactionCostPct: number;
}): RebalanceImpactResult {
  const driftBeforePct = Math.abs(
    input.currentEquityPct - input.targetEquityPct,
  );
  const tradeValueUsd =
    (input.portfolioValueUsd *
      Math.abs(input.currentEquityPct - input.targetEquityPct)) /
    100;
  const estimatedCostUsd = (tradeValueUsd * input.transactionCostPct) / 100;

  return {
    tradeValueUsd,
    estimatedCostUsd,
    driftBeforePct,
    driftAfterPct: 0,
  };
}

export type WithdrawalStressResult = {
  survivesYears: number;
  depleted: boolean;
  endingBalanceUsd: number;
};

export function stressTestWithdrawal(input: {
  portfolioUsd: number;
  annualWithdrawalUsd: number;
  expectedReturnPct: number;
  inflationPct: number;
  maxYears: number;
}): WithdrawalStressResult {
  let balance = input.portfolioUsd;
  let years = 0;
  let withdrawal = input.annualWithdrawalUsd;

  while (years < input.maxYears && balance > 0) {
    balance = balance * (1 + input.expectedReturnPct / 100) - withdrawal;
    withdrawal *= 1 + input.inflationPct / 100;
    years += 1;
    if (balance <= 0) {
      return { survivesYears: years - 1, depleted: true, endingBalanceUsd: 0 };
    }
  }

  return {
    survivesYears: years,
    depleted: false,
    endingBalanceUsd: Math.max(balance, 0),
  };
}

export type MortgageVsInvestResult = {
  paydownWealthUsd: number;
  investWealthUsd: number;
  investAdvantageUsd: number;
};

export function compareMortgageVsInvest(input: {
  extraMonthlyUsd: number;
  mortgageRatePct: number;
  mortgageBalanceUsd: number;
  investmentReturnPct: number;
  years: number;
}): MortgageVsInvestResult {
  const months = input.years * 12;
  const monthlyMortgageRate = input.mortgageRatePct / 100 / 12;
  let balance = input.mortgageBalanceUsd;
  let paydownSaved = 0;

  for (let month = 0; month < months; month += 1) {
    const interest = balance * monthlyMortgageRate;
    paydownSaved += interest;
    balance = Math.max(balance - input.extraMonthlyUsd, 0);
  }

  const monthlyInvestRate = input.investmentReturnPct / 100 / 12;
  const investWealthUsd =
    monthlyInvestRate === 0
      ? input.extraMonthlyUsd * months
      : input.extraMonthlyUsd *
        ((Math.pow(1 + monthlyInvestRate, months) - 1) / monthlyInvestRate);

  const paydownWealthUsd = paydownSaved + input.extraMonthlyUsd * months;

  return {
    paydownWealthUsd,
    investWealthUsd,
    investAdvantageUsd: investWealthUsd - paydownWealthUsd,
  };
}

export type TaxEquivalentYieldResult = {
  taxEquivalentYieldPct: number;
  afterTaxYieldPct: number;
};

export function taxEquivalentYield(input: {
  taxableYieldPct: number;
  marginalTaxRatePct: number;
  tbillYieldPct: number;
}): TaxEquivalentYieldResult {
  const afterTaxYieldPct =
    input.taxableYieldPct * (1 - input.marginalTaxRatePct / 100);
  const taxEquivalentYieldPct =
    input.tbillYieldPct / (1 - input.marginalTaxRatePct / 100);

  return { taxEquivalentYieldPct, afterTaxYieldPct };
}
