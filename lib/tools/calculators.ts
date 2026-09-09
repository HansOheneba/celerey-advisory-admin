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
