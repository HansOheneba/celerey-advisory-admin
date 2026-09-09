import type { Metadata } from "next";

import { ToolsView, type ToolClientSeed } from "@/components/tools/tools-view";
import { requireSession } from "@/lib/dal";
import { getScopedClientRecords } from "@/lib/demo/repositories";

export const metadata: Metadata = {
  title: "Tools",
};

export default async function ToolsPage() {
  await requireSession();
  const records = await getScopedClientRecords();

  const clients: ToolClientSeed[] = records.map((record) => ({
    id: record.client.id,
    name: `${record.client.firstName} ${record.client.lastName}`,
    portfolioValueUsd: record.client.aua,
    cashWeightingPct: record.idleCashPct,
    targetCashWeightingPct: record.targetCashPct,
    currentAge: record.detail.retirement.currentAge,
    retirementAge: record.detail.retirement.retirementAge,
    currentSavingsUsd: record.detail.retirement.currentInvested,
    monthlySavingsUsd: record.detail.retirement.monthlySavings,
    expectedReturnPct: record.detail.retirement.expectedReturnPct,
    desiredMonthlyIncomeUsd: record.detail.retirement.desiredMonthlyIncome,
    safeWithdrawalRatePct: record.detail.retirement.safeWithdrawalRatePct,
  }));

  return <ToolsView clients={clients} />;
}
