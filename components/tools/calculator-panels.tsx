"use client";

import {
  Banknote,
  Clock,
  GraduationCap,
  Home,
  Landmark,
  PiggyBank,
  Scale,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  CalculatorCard,
  NumberField,
} from "@/components/tools/calculator-shell";
import type { ToolClientSeed } from "@/components/tools/tools-view";
import { formatCurrency } from "@/lib/format";
import {
  assessEmergencyFund,
  compareMortgageVsInvest,
  modelCashDeployment,
  modelFxExposure,
  modelLendingCapacity,
  modelPropertyEquity,
  modelRebalanceImpact,
  modelTbillLadder,
  projectEducationFunding,
  projectGoalFunding,
  projectRetirement,
  stressTestWithdrawal,
  taxEquivalentYield,
} from "@/lib/tools/calculators";

export function RetirementCalculatorPanel({ seed }: { seed: ToolClientSeed }) {
  const [currentAge, setCurrentAge] = useState(seed.currentAge);
  const [retirementAge, setRetirementAge] = useState(seed.retirementAge);
  const [savings, setSavings] = useState(seed.currentSavingsUsd);
  const [monthly, setMonthly] = useState(seed.monthlySavingsUsd);
  const [returnPct, setReturnPct] = useState(seed.expectedReturnPct);
  const [income, setIncome] = useState(seed.desiredMonthlyIncomeUsd);

  const result = useMemo(
    () =>
      projectRetirement({
        currentAge,
        retirementAge,
        currentSavingsUsd: savings,
        monthlyContributionUsd: monthly,
        expectedReturnPct: returnPct,
        desiredMonthlyIncomeUsd: income,
        safeWithdrawalRatePct: seed.safeWithdrawalRatePct,
      }),
    [currentAge, retirementAge, savings, monthly, returnPct, income, seed.safeWithdrawalRatePct],
  );

  return (
    <CalculatorCard
      title="Retirement projection"
      description={`${seed.safeWithdrawalRatePct}% withdrawal rate`}
      icon={Clock}
      inputs={
        <>
          <NumberField label="Current age" value={currentAge} onChange={setCurrentAge} />
          <NumberField label="Retirement age" value={retirementAge} onChange={setRetirementAge} />
          <NumberField label="Invested today" value={savings} onChange={setSavings} step={1000} />
          <NumberField label="Monthly savings" value={monthly} onChange={setMonthly} step={100} />
          <NumberField label="Expected return %" value={returnPct} onChange={setReturnPct} step={0.1} />
          <NumberField label="Desired monthly income" value={income} onChange={setIncome} step={500} />
        </>
      }
      primaryResult={{ label: "Projected pot", value: formatCurrency(result.projectedPotUsd, "USD") }}
      secondaryResults={[
        { label: "Required pot", value: formatCurrency(result.requiredPotUsd, "USD") },
        { label: result.gapUsd > 0 ? "Shortfall" : "Surplus", value: formatCurrency(Math.abs(result.gapUsd), "USD"), tone: result.gapUsd > 0 ? "bad" : "good" },
        { label: "Extra monthly saving", value: formatCurrency(result.additionalMonthlySavingsUsd, "USD"), tone: result.additionalMonthlySavingsUsd > 0 ? "bad" : "good" },
      ]}
      talkingPoint={
        result.gapUsd > 0
          ? `${formatCurrency(result.gapUsd, "USD")} short. Add about ${formatCurrency(result.additionalMonthlySavingsUsd, "USD")}/month.`
          : `On track for ${formatCurrency(income, "USD")}/month at retirement.`
      }
    />
  );
}

export function GoalCalculatorPanel({ seed }: { seed: ToolClientSeed }) {
  const [target, setTarget] = useState(seed.primaryGoalTargetUsd ?? 500_000);
  const [current, setCurrent] = useState(seed.primaryGoalCurrentUsd ?? 120_000);
  const [monthly, setMonthly] = useState(3_000);
  const [years, setYears] = useState(8);
  const [returnPct, setReturnPct] = useState(seed.expectedReturnPct);

  const result = useMemo(
    () => projectGoalFunding({ targetUsd: target, currentUsd: current, monthlyContributionUsd: monthly, years, expectedReturnPct: returnPct }),
    [target, current, monthly, years, returnPct],
  );

  return (
    <CalculatorCard
      title="Goal funding"
      icon={Target}
      variant="success"
      inputs={
        <>
          <NumberField label="Target" value={target} onChange={setTarget} step={10_000} />
          <NumberField label="Funded today" value={current} onChange={setCurrent} step={10_000} />
          <NumberField label="Monthly contribution" value={monthly} onChange={setMonthly} step={250} />
          <NumberField label="Years" value={years} onChange={setYears} />
          <NumberField label="Expected return %" value={returnPct} onChange={setReturnPct} step={0.1} />
        </>
      }
      primaryResult={{ label: "Projected value", value: formatCurrency(result.projectedUsd, "USD"), tone: result.fundedPct >= 100 ? "good" : "neutral" }}
      secondaryResults={[
        { label: "Funded", value: `${result.fundedPct.toFixed(0)}%`, tone: result.fundedPct >= 100 ? "good" : "bad" },
        { label: "Shortfall", value: formatCurrency(result.shortfallUsd, "USD"), tone: result.shortfallUsd > 0 ? "bad" : "good" },
        { label: "Monthly needed", value: formatCurrency(result.requiredMonthlyUsd, "USD") },
      ]}
      talkingPoint={
        result.fundedPct >= 100
          ? "Fully funded on current contributions."
          : `${result.fundedPct.toFixed(0)}% funded. Need ${formatCurrency(result.requiredMonthlyUsd, "USD")}/month to close it.`
      }
    />
  );
}

export function EducationCalculatorPanel({ seed }: { seed: ToolClientSeed }) {
  const dependent = seed.educationDependents?.[0];
  const [childAge, setChildAge] = useState(dependent?.ageYears ?? 10);
  const [enrollmentAge, setEnrollmentAge] = useState(18);
  const [fees, setFees] = useState(25_000);
  const [inflation, setInflation] = useState(8);
  const [current, setCurrent] = useState(seed.primaryGoalCurrentUsd ?? 50_000);
  const [monthly, setMonthly] = useState(2_000);
  const [returnPct, setReturnPct] = useState(seed.expectedReturnPct);

  const result = useMemo(
    () => projectEducationFunding({ childAge, enrollmentAge, annualFeesToday: fees, feeInflationPct: inflation, currentFundUsd: current, monthlyContributionUsd: monthly, expectedReturnPct: returnPct }),
    [childAge, enrollmentAge, fees, inflation, current, monthly, returnPct],
  );

  return (
    <CalculatorCard
      title="Education funding"
      icon={GraduationCap}
      variant="success"
      inputs={
        <>
          <NumberField label="Child age" value={childAge} onChange={setChildAge} />
          <NumberField label="Enrollment age" value={enrollmentAge} onChange={setEnrollmentAge} />
          <NumberField label="Annual fees today" value={fees} onChange={setFees} step={1000} />
          <NumberField label="Fee inflation %" value={inflation} onChange={setInflation} step={0.5} />
          <NumberField label="Fund today" value={current} onChange={setCurrent} step={5000} />
          <NumberField label="Monthly contribution" value={monthly} onChange={setMonthly} step={100} />
        </>
      }
      primaryResult={{ label: "Fees at enrollment", value: formatCurrency(result.projectedFeesAtEnrollment, "USD") }}
      secondaryResults={[
        { label: "Projected fund", value: formatCurrency(result.projectedUsd, "USD") },
        { label: "Funded", value: `${result.fundedPct.toFixed(0)}%`, tone: result.fundedPct >= 100 ? "good" : "bad" },
        { label: "Shortfall", value: formatCurrency(result.shortfallUsd, "USD"), tone: result.shortfallUsd > 0 ? "bad" : "good" },
      ]}
      talkingPoint={
        result.fundedPct >= 100
          ? `Fees at ${enrollmentAge} are covered.`
          : `${result.fundedPct.toFixed(0)}% funded. ${formatCurrency(result.shortfallUsd, "USD")} gap at enrollment.`
      }
    />
  );
}

export function CashCalculatorPanel({ seed }: { seed: ToolClientSeed }) {
  const [portfolio, setPortfolio] = useState(seed.portfolioValueUsd);
  const [cashPct, setCashPct] = useState(seed.cashWeightingPct);
  const [targetPct, setTargetPct] = useState(seed.targetCashWeightingPct);
  const [depositPct, setDepositPct] = useState(4.5);
  const [returnPct, setReturnPct] = useState(seed.expectedReturnPct);

  const result = useMemo(
    () => modelCashDeployment({ portfolioValueUsd: portfolio, cashWeightingPct: cashPct, targetCashWeightingPct: targetPct, depositRatePct: depositPct, expectedReturnPct: returnPct }),
    [portfolio, cashPct, targetPct, depositPct, returnPct],
  );

  return (
    <CalculatorCard title="Cash deployment" icon={PiggyBank} variant="info"
      inputs={<><NumberField label="Portfolio value" value={portfolio} onChange={setPortfolio} step={100_000} /><NumberField label="Cash weighting %" value={cashPct} onChange={setCashPct} step={0.5} /><NumberField label="Target cash %" value={targetPct} onChange={setTargetPct} step={0.5} /><NumberField label="Deposit rate %" value={depositPct} onChange={setDepositPct} step={0.1} /><NumberField label="Expected return %" value={returnPct} onChange={setReturnPct} step={0.1} /></>}
      primaryResult={{ label: "Deployable cash", value: formatCurrency(result.deployableUsd, "USD") }}
      secondaryResults={[{ label: "Incremental return p.a.", value: formatCurrency(result.incrementalAnnualReturnUsd, "USD"), tone: "good" }, { label: "Value in 5 years", value: formatCurrency(result.fiveYearValueUsd, "USD") }, { label: "5-year opportunity cost", value: formatCurrency(result.opportunityCostUsd, "USD"), tone: "bad" }]}
      talkingPoint={
        result.deployableUsd > 0
          ? `${formatCurrency(result.deployableUsd, "USD")} sitting idle. Costs about ${formatCurrency(result.opportunityCostUsd, "USD")} over five years.`
          : "Nothing excess to deploy."
      }
    />
  );
}

export function LendingCalculatorPanel({ seed }: { seed: ToolClientSeed }) {
  const [portfolio, setPortfolio] = useState(seed.portfolioValueUsd);
  const [advancePct, setAdvancePct] = useState(50);
  const [existing, setExisting] = useState(seed.mortgageBalanceUsd);
  const [ratePct, setRatePct] = useState(6.5);

  const result = useMemo(
    () => modelLendingCapacity({ portfolioValueUsd: portfolio, advanceRatePct: advancePct, existingBorrowingUsd: existing, interestRatePct: ratePct }),
    [portfolio, advancePct, existing, ratePct],
  );

  return (
    <CalculatorCard title="Lombard capacity" icon={Home} variant="warning"
      inputs={<><NumberField label="Portfolio value" value={portfolio} onChange={setPortfolio} step={100_000} /><NumberField label="Advance rate %" value={advancePct} onChange={setAdvancePct} step={5} /><NumberField label="Existing borrowing" value={existing} onChange={setExisting} step={50_000} /><NumberField label="Interest rate %" value={ratePct} onChange={setRatePct} step={0.1} /></>}
      primaryResult={{ label: "Available headroom", value: formatCurrency(result.headroomUsd, "USD"), tone: "good" }}
      secondaryResults={[{ label: "Maximum facility", value: formatCurrency(result.maximumFacilityUsd, "USD") }, { label: "Interest at full draw", value: formatCurrency(result.annualInterestUsd, "USD") }, { label: "Eligible collateral", value: formatCurrency(result.eligibleCollateralUsd, "USD") }]}
      talkingPoint={`${formatCurrency(result.headroomUsd, "USD")} to borrow. Full draw is ${formatCurrency(result.annualInterestUsd, "USD")}/year in interest.`}
    />
  );
}

export function FxCalculatorPanel({ seed }: { seed: ToolClientSeed }) {
  const [portfolio, setPortfolio] = useState(seed.portfolioValueUsd);
  const [ghsExpenses, setGhsExpenses] = useState(Math.round(seed.monthlyExpensesUsd * 12.5));
  const [rate, setRate] = useState(12.5);
  const [shock, setShock] = useState(10);

  const result = useMemo(
    () => modelFxExposure({ usdPortfolioUsd: portfolio, monthlyGhsExpenses: ghsExpenses / 12, usdGhsRate: rate, fxShockPct: shock }),
    [portfolio, ghsExpenses, rate, shock],
  );

  return (
    <CalculatorCard title="FX exposure" icon={TrendingUp}
      inputs={<><NumberField label="USD portfolio" value={portfolio} onChange={setPortfolio} step={100_000} /><NumberField label="Annual GHS expenses" value={ghsExpenses} onChange={setGhsExpenses} step={5000} /><NumberField label="USD/GHS rate" value={rate} onChange={setRate} step={0.1} /><NumberField label="FX shock %" value={shock} onChange={setShock} step={1} /></>}
      primaryResult={{ label: "Additional USD needed p.a.", value: formatCurrency(result.additionalUsdNeeded, "USD"), tone: result.additionalUsdNeeded > 0 ? "bad" : "good" }}
      secondaryResults={[{ label: "GHS expenses in USD", value: formatCurrency(result.annualGhsExpensesUsd, "USD") }, { label: "Post-shock cost", value: formatCurrency(result.postShockAnnualCostUsd, "USD") }, { label: "Suggested hedge", value: formatCurrency(result.hedgeNotionalUsd, "USD") }]}
      talkingPoint={
        result.additionalUsdNeeded > 0
          ? `A ${shock}% cedi move adds ${formatCurrency(result.additionalUsdNeeded, "USD")}/year. Hedge about ${formatCurrency(result.hedgeNotionalUsd, "USD")}.`
          : "Cedi shock looks manageable at this level."
      }
    />
  );
}

export function TbillCalculatorPanel({ seed }: { seed: ToolClientSeed }) {
  const [principal, setPrincipal] = useState(Math.round(seed.portfolioValueUsd * (seed.cashWeightingPct / 100)));
  const [w91, setW91] = useState(40);
  const [w182, setW182] = useState(35);
  const [w364, setW364] = useState(25);

  const result = useMemo(
    () => modelTbillLadder({ principalUsd: principal, allocation91Pct: w91, allocation182Pct: w182, allocation364Pct: w364, yield91Pct: 28, yield182Pct: 29, yield364Pct: 30, depositRatePct: 4.5, months: 12 }),
    [principal, w91, w182, w364],
  );

  return (
    <CalculatorCard title="T-Bill ladder" icon={Landmark}
      inputs={<><NumberField label="Principal" value={principal} onChange={setPrincipal} step={50_000} /><NumberField label="91-day %" value={w91} onChange={setW91} /><NumberField label="182-day %" value={w182} onChange={setW182} /><NumberField label="364-day %" value={w364} onChange={setW364} /></>}
      primaryResult={{ label: "Weighted yield", value: `${result.weightedYieldPct.toFixed(1)}%`, tone: "good" }}
      secondaryResults={[{ label: "12-month value", value: formatCurrency(result.projectedValueUsd, "USD") }, { label: "Call deposit alt.", value: formatCurrency(result.depositAlternativeUsd, "USD") }, { label: "Uplift", value: formatCurrency(result.upliftUsd, "USD"), tone: "good" }]}
      talkingPoint={`${result.weightedYieldPct.toFixed(1)}% blended. ${formatCurrency(result.upliftUsd, "USD")} more than call over 12 months.`}
    />
  );
}

export function PropertyEquityPanel({ seed }: { seed: ToolClientSeed }) {
  const [property, setProperty] = useState(seed.propertyValueUsd);
  const [mortgage, setMortgage] = useState(seed.mortgageBalanceUsd);
  const [ltv, setLtv] = useState(65);

  const result = useMemo(
    () => modelPropertyEquity({ propertyValueUsd: property, mortgageBalanceUsd: mortgage, maxLtvPct: ltv, portfolioValueUsd: seed.portfolioValueUsd, advanceRatePct: 50, existingBorrowingUsd: mortgage }),
    [property, mortgage, ltv, seed.portfolioValueUsd],
  );

  return (
    <CalculatorCard title="Property equity" icon={Home} variant="warning"
      inputs={<><NumberField label="Property value" value={property} onChange={setProperty} step={50_000} /><NumberField label="Mortgage balance" value={mortgage} onChange={setMortgage} step={25_000} /><NumberField label="Max LTV %" value={ltv} onChange={setLtv} step={5} /></>}
      primaryResult={{ label: "Total borrowing capacity", value: formatCurrency(result.totalBorrowingCapacityUsd, "USD"), tone: "good" }}
      secondaryResults={[{ label: "Gross equity", value: formatCurrency(result.grossEquityUsd, "USD") }, { label: "Property headroom", value: formatCurrency(result.netEquityUsd, "USD") }, { label: "Securities headroom", value: formatCurrency(result.securitiesHeadroomUsd, "USD") }]}
      talkingPoint={`About ${formatCurrency(result.totalBorrowingCapacityUsd, "USD")} to borrow without selling.`}
    />
  );
}

export function EmergencyFundPanel({ seed }: { seed: ToolClientSeed }) {
  const [expenses, setExpenses] = useState(seed.monthlyEssentialExpensesUsd);
  const [liquid, setLiquid] = useState(Math.round(seed.portfolioValueUsd * (seed.cashWeightingPct / 100)));
  const [months, setMonths] = useState(6);

  const result = useMemo(
    () => assessEmergencyFund({ monthlyEssentialExpensesUsd: expenses, liquidBalanceUsd: liquid, targetMonths: months }),
    [expenses, liquid, months],
  );

  return (
    <CalculatorCard title="Emergency fund" icon={Shield} variant="info"
      inputs={<><NumberField label="Monthly essentials" value={expenses} onChange={setExpenses} step={500} /><NumberField label="Liquid balance" value={liquid} onChange={setLiquid} step={10_000} /><NumberField label="Target months" value={months} onChange={setMonths} /></>}
      primaryResult={{ label: "Months covered", value: result.monthsCovered.toFixed(1), tone: result.isAdequate ? "good" : "bad" }}
      secondaryResults={[{ label: "Target balance", value: formatCurrency(result.targetBalanceUsd, "USD") }, { label: "Gap", value: formatCurrency(result.gapUsd, "USD"), tone: result.gapUsd > 0 ? "bad" : "good" }, { label: "Status", value: result.isAdequate ? "Adequate" : "Below target", tone: result.isAdequate ? "good" : "bad" }]}
      talkingPoint={
        result.isAdequate
          ? `${result.monthsCovered.toFixed(1)} months covered. Above your ${months}-month target.`
          : `${formatCurrency(result.gapUsd, "USD")} short of a ${months}-month buffer.`
      }
    />
  );
}

export function RebalancePanel({ seed }: { seed: ToolClientSeed }) {
  const [equity, setEquity] = useState(55);
  const [target, setTarget] = useState(45);
  const [cost, setCost] = useState(0.25);

  const result = useMemo(
    () => modelRebalanceImpact({ portfolioValueUsd: seed.portfolioValueUsd, currentEquityPct: equity, targetEquityPct: target, transactionCostPct: cost }),
    [seed.portfolioValueUsd, equity, target, cost],
  );

  return (
    <CalculatorCard title="Rebalance impact" icon={Scale} variant="info"
      inputs={<><NumberField label="Current equity %" value={equity} onChange={setEquity} step={1} /><NumberField label="Target equity %" value={target} onChange={setTarget} step={1} /><NumberField label="Transaction cost %" value={cost} onChange={setCost} step={0.05} /></>}
      primaryResult={{ label: "Trade value", value: formatCurrency(result.tradeValueUsd, "USD") }}
      secondaryResults={[{ label: "Est. cost", value: formatCurrency(result.estimatedCostUsd, "USD"), tone: "bad" }, { label: "Drift before", value: `${result.driftBeforePct.toFixed(1)}%` }, { label: "Drift after", value: `${result.driftAfterPct.toFixed(1)}%`, tone: "good" }]}
      talkingPoint={`${formatCurrency(result.tradeValueUsd, "USD")} trade, about ${formatCurrency(result.estimatedCostUsd, "USD")} in fees.`}
    />
  );
}

export function WithdrawalStressPanel({ seed }: { seed: ToolClientSeed }) {
  const [portfolio, setPortfolio] = useState(seed.currentSavingsUsd);
  const [withdrawal, setWithdrawal] = useState(seed.desiredMonthlyIncomeUsd * 12);
  const [returnPct, setReturnPct] = useState(seed.expectedReturnPct);
  const [inflation, setInflation] = useState(3);

  const result = useMemo(
    () => stressTestWithdrawal({ portfolioUsd: portfolio, annualWithdrawalUsd: withdrawal, expectedReturnPct: returnPct, inflationPct: inflation, maxYears: 30 }),
    [portfolio, withdrawal, returnPct, inflation],
  );

  return (
    <CalculatorCard title="Withdrawal stress test" icon={Shield} variant="warning"
      inputs={<><NumberField label="Portfolio" value={portfolio} onChange={setPortfolio} step={100_000} /><NumberField label="Annual withdrawal" value={withdrawal} onChange={setWithdrawal} step={5000} /><NumberField label="Return %" value={returnPct} onChange={setReturnPct} step={0.1} /><NumberField label="Inflation %" value={inflation} onChange={setInflation} step={0.1} /></>}
      primaryResult={{ label: "Survives (years)", value: String(result.survivesYears), tone: result.depleted ? "bad" : "good" }}
      secondaryResults={[{ label: "Depleted", value: result.depleted ? "Yes" : "No", tone: result.depleted ? "bad" : "good" }, { label: "Ending balance", value: formatCurrency(result.endingBalanceUsd, "USD") }]}
      talkingPoint={
        result.depleted
          ? `Runs out in ${result.survivesYears} years at this withdrawal rate.`
          : `Lasts 30 years with ${formatCurrency(result.endingBalanceUsd, "USD")} left.`
      }
    />
  );
}

export function MortgageVsInvestPanel({ seed }: { seed: ToolClientSeed }) {
  const [extra, setExtra] = useState(2_000);
  const [mortgageRate, setMortgageRate] = useState(12);
  const [balance, setBalance] = useState(seed.mortgageBalanceUsd);
  const [years, setYears] = useState(10);

  const result = useMemo(
    () => compareMortgageVsInvest({ extraMonthlyUsd: extra, mortgageRatePct: mortgageRate, mortgageBalanceUsd: balance, investmentReturnPct: seed.expectedReturnPct, years }),
    [extra, mortgageRate, balance, seed.expectedReturnPct, years],
  );

  return (
    <CalculatorCard title="Mortgage vs invest" icon={Scale} variant="warning"
      inputs={<><NumberField label="Extra monthly" value={extra} onChange={setExtra} step={100} /><NumberField label="Mortgage rate %" value={mortgageRate} onChange={setMortgageRate} step={0.1} /><NumberField label="Mortgage balance" value={balance} onChange={setBalance} step={25_000} /><NumberField label="Years" value={years} onChange={setYears} /></>}
      primaryResult={{ label: "Invest advantage", value: formatCurrency(result.investAdvantageUsd, "USD"), tone: result.investAdvantageUsd >= 0 ? "good" : "bad" }}
      secondaryResults={[{ label: "Paydown path", value: formatCurrency(result.paydownWealthUsd, "USD") }, { label: "Invest path", value: formatCurrency(result.investWealthUsd, "USD") }]}
      talkingPoint={
        result.investAdvantageUsd >= 0
          ? `Investing wins by ${formatCurrency(result.investAdvantageUsd, "USD")} over ${years} years.`
          : `Paydown wins by ${formatCurrency(Math.abs(result.investAdvantageUsd), "USD")} over ${years} years.`
      }
    />
  );
}

export function TaxEquivalentPanel({ seed }: { seed: ToolClientSeed }) {
  const [taxable, setTaxable] = useState(8);
  const [taxRate, setTaxRate] = useState(seed.marginalTaxRatePct ?? 30);
  const [tbill, setTbill] = useState(28);

  const result = useMemo(
    () => taxEquivalentYield({ taxableYieldPct: taxable, marginalTaxRatePct: taxRate, tbillYieldPct: tbill }),
    [taxable, taxRate, tbill],
  );

  return (
    <CalculatorCard title="Tax-equivalent yield" icon={Banknote} variant="info"
      inputs={<><NumberField label="Taxable yield %" value={taxable} onChange={setTaxable} step={0.1} /><NumberField label="Marginal tax %" value={taxRate} onChange={setTaxRate} step={1} /><NumberField label="T-bill yield %" value={tbill} onChange={setTbill} step={0.1} /></>}
      primaryResult={{ label: "Tax-equivalent yield", value: `${result.taxEquivalentYieldPct.toFixed(2)}%` }}
      secondaryResults={[{ label: "After-tax yield", value: `${result.afterTaxYieldPct.toFixed(2)}%` }]}
      talkingPoint={
        result.afterTaxYieldPct >= tbill
          ? "Taxable bond wins after tax."
          : "T-bill wins after tax."
      }
    />
  );
}
