import type { Metadata } from "next";

import { ToolsView, type ToolClientSeed } from "@/components/tools/tools-view";
import { requireSession } from "@/lib/dal";
import { getScopedClientRecords } from "@/lib/demo/repositories";

export const metadata: Metadata = {
  title: "Client calculators",
  description: "Planning calculators on client book data.",
};

export default async function ToolsPage() {
  await requireSession();
  const records = await getScopedClientRecords();

  const clients: ToolClientSeed[] = records.map((record) => {
    const monthlyExpenses = record.detail.expenseCategories.reduce(
      (total, row) => total + row.amount,
      0,
    );
    const monthlyEssential = record.detail.expenseCategories
      .filter((row) => row.essential)
      .reduce((total, row) => total + row.amount, 0);
    const propertyValue = record.detail.propertyAssets.reduce(
      (total, property) =>
        total + (property.current_value ?? property.purchase_price ?? 0),
      0,
    );
    const mortgageBalance = record.detail.liabilities
      .filter((liability) => liability.type === "mortgage")
      .reduce((total, liability) => total + liability.balance, 0);
    const primaryGoal = record.detail.goals[0];

    return {
      id: record.client.id,
      name: `${record.client.firstName} ${record.client.lastName}`,
      currency: record.client.currency,
      portfolioValueUsd: (record.client.aua ?? 0) + (record.client.aum ?? 0),
      cashWeightingPct: record.idleCashPct,
      targetCashWeightingPct: record.targetCashPct,
      currentAge: record.detail.retirement.currentAge,
      retirementAge: record.detail.retirement.retirementAge,
      currentSavingsUsd: record.detail.retirement.currentInvested,
      monthlySavingsUsd: record.detail.retirement.monthlySavings,
      expectedReturnPct: record.detail.retirement.expectedReturnPct,
      desiredMonthlyIncomeUsd: record.detail.retirement.desiredMonthlyIncome,
      safeWithdrawalRatePct: record.detail.retirement.safeWithdrawalRatePct,
      monthlyExpensesUsd: monthlyExpenses,
      monthlyEssentialExpensesUsd: monthlyEssential || monthlyExpenses * 0.64,
      propertyValueUsd: propertyValue,
      mortgageBalanceUsd: mortgageBalance,
      primaryGoalTargetUsd: primaryGoal?.target,
      primaryGoalCurrentUsd: primaryGoal?.current,
      marginalTaxRatePct: 30,
    };
  });

  return <ToolsView clients={clients} />;
}
