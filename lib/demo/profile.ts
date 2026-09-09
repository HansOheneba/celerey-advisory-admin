import "server-only";

import { revalidatePath } from "next/cache";

import { can } from "@/lib/auth/capabilities";
import { requireSession } from "@/lib/dal";
import { getClientRecord } from "@/lib/demo/repositories";
import { mutateDemoDb } from "@/lib/demo/store";
import type { DemoClientRecord, DemoDatabase } from "@/lib/demo/types";
import type {
  ProfileCollection,
  ProfileWriteResult,
} from "@/lib/demo/profile-types";

export type { ProfileCollection, ProfileWriteResult };

const ASSET_CLASS_LABEL: Record<string, string> = {
  stock: "Equities",
  etf: "Equities",
  mutual_fund: "Equities",
  bond: "Fixed income",
  crypto: "Alternatives",
  alternative: "Alternatives",
  cash: "Cash",
  other: "Other",
};

export function assetClassLabel(assetType: string): string {
  return ASSET_CLASS_LABEL[assetType] ?? assetType;
}

export function nextProfileId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function round(value: number): number {
  return Math.round(value);
}

function buildAllocation(record: DemoClientRecord) {
  const byType = new Map<string, number>();

  for (const holding of record.detail.holdings) {
    const label = assetClassLabel(String(holding.asset_type || "other"));
    byType.set(label, (byType.get(label) ?? 0) + (holding.current_value ?? 0));
  }

  const cash = record.detail.accounts.reduce(
    (total, account) => total + account.balance,
    0,
  );

  if (cash > 0) {
    byType.set("Cash", (byType.get("Cash") ?? 0) + cash);
  }

  const total = [...byType.values()].reduce((sum, value) => sum + value, 0);

  return [...byType.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value: round(value),
      percentage: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
    }));
}

/** Recompute AUA, allocation, goals meta and cash-flow after a profile write. */
export function syncClientDerived(record: DemoClientRecord) {
  const holdingsTotal = record.detail.holdings.reduce(
    (total, holding) => total + (holding.current_value ?? 0),
    0,
  );
  const cash = record.detail.accounts.reduce(
    (total, account) => total + account.balance,
    0,
  );
  const aua = round(holdingsTotal + cash);

  record.client.aua = aua;
  record.idleCashPct = aua > 0 ? Math.round((cash / aua) * 1000) / 10 : 0;
  record.client.goalsCount = record.detail.goals.length;

  const goals = record.detail.goals;
  record.detail.goalsMeta = {
    totalMonthlyNeeded: round(
      goals.reduce((total, goal) => total + (goal.monthlyContribution ?? 0), 0),
    ),
    totalGoals: goals.length,
    completedGoals: goals.filter((goal) => goal.status === "completed").length,
    activeGoals: goals.filter((goal) => goal.status !== "completed").length,
  };

  record.detail.allocation = buildAllocation(record);

  const monthlyIncome = record.detail.incomeRows.reduce(
    (total, row) => total + row.amount,
    0,
  );
  const monthlyExpenses = record.detail.expenseCategories.reduce(
    (total, row) => total + row.amount,
    0,
  );
  const surplus = monthlyIncome - monthlyExpenses;

  record.detail.cashFlowSummary = {
    monthly_income: monthlyIncome,
    monthly_expenses: monthlyExpenses,
    monthly_surplus: surplus,
    savings_rate_pct:
      monthlyIncome > 0
        ? Math.round((surplus / monthlyIncome) * 1000) / 10
        : 0,
    currency: record.client.currency,
  };

  const monthsCovered =
    monthlyExpenses > 0
      ? Math.round(
          (record.detail.emergencyFund.currentCashBalance / monthlyExpenses) *
            10,
        ) / 10
      : 0;
  const targetCash =
    monthlyExpenses * record.detail.emergencyFund.targetMonths;

  record.detail.emergencyFund.computed = {
    monthsCovered,
    gap: Math.max(
      0,
      round(targetCash - record.detail.emergencyFund.currentCashBalance),
    ),
  };

  const series = record.detail.portfolioPerformance;
  if (series.length > 0) {
    series[series.length - 1] = {
      ...series[series.length - 1],
      value: aua,
    };
  }

  const history = record.detail.cashFlowHistory;
  if (history.length > 0) {
    history[history.length - 1] = {
      ...history[history.length - 1],
      income: monthlyIncome,
      expenses: monthlyExpenses,
      surplus,
    };
  }
}

export async function writeClientProfile(
  clientId: string,
  auditAction: string,
  auditLabel: string,
  mutator: (record: DemoClientRecord) => void,
): Promise<ProfileWriteResult> {
  const session = await requireSession();

  if (
    !can(session.demoRole, "edit_client_data") &&
    !can(session.demoRole, "execute_trade")
  ) {
    return {
      ok: false,
      message: "Your role cannot update this client's profile.",
    };
  }

  const visible = await getClientRecord(clientId);

  if (!visible) {
    return { ok: false, message: "That client is not in your book." };
  }

  const found = await mutateDemoDb((db: DemoDatabase) => {
    const record = db.clients.find(
      (candidate) => candidate.client.id === clientId,
    );

    if (!record) {
      return false;
    }

    mutator(record);
    syncClientDerived(record);

    db.auditLogs.unshift({
      id: nextProfileId("audit"),
      actorId: session.userId,
      actorName: session.name,
      action: auditAction,
      targetType: "client",
      targetId: clientId,
      targetLabel: auditLabel,
      occurredAt: new Date().toISOString(),
    });

    return true;
  });

  if (!found) {
    return { ok: false, message: "That client is not in your book." };
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/clients");
  revalidatePath("/dashboard");

  return { ok: true };
}

export function yearsRemainingFrom(isoDate: string): number {
  const years =
    (new Date(isoDate).getTime() - Date.now()) /
    (365.25 * 24 * 60 * 60 * 1000);

  return Math.max(0, Math.round(years * 10) / 10);
}

export function monthlyNeeded(
  target: number,
  current: number,
  years: number,
): number {
  const remaining = Math.max(0, target - current);
  const months = Math.max(years * 12, 1);

  return round(remaining / months);
}

export function removeProfileItem(
  record: DemoClientRecord,
  collection: ProfileCollection,
  itemId: string,
): boolean {
  switch (collection) {
    case "goals": {
      const next = record.detail.goals.filter((item) => item.id !== itemId);
      if (next.length === record.detail.goals.length) return false;
      record.detail.goals = next;
      return true;
    }
    case "holdings": {
      const next = record.detail.holdings.filter(
        (item) => item.holding_id !== itemId,
      );
      if (next.length === record.detail.holdings.length) return false;
      record.detail.holdings = next;
      return true;
    }
    case "accounts": {
      const next = record.detail.accounts.filter((item) => item.id !== itemId);
      if (next.length === record.detail.accounts.length) return false;
      record.detail.accounts = next;
      return true;
    }
    case "incomeRows": {
      const next = record.detail.incomeRows.filter(
        (item) => item.id !== itemId,
      );
      if (next.length === record.detail.incomeRows.length) return false;
      record.detail.incomeRows = next;
      return true;
    }
    case "expenseCategories": {
      const next = record.detail.expenseCategories.filter(
        (item) => item.id !== itemId,
      );
      if (next.length === record.detail.expenseCategories.length) return false;
      record.detail.expenseCategories = next;
      return true;
    }
    case "liabilities": {
      const next = record.detail.liabilities.filter(
        (item) => item.id !== itemId,
      );
      if (next.length === record.detail.liabilities.length) return false;
      record.detail.liabilities = next;
      return true;
    }
    case "propertyAssets": {
      const next = record.detail.propertyAssets.filter(
        (item) => item.property_id !== itemId,
      );
      if (next.length === record.detail.propertyAssets.length) return false;
      record.detail.propertyAssets = next;
      return true;
    }
    case "insurancePolicies": {
      const next = record.detail.insurancePolicies.filter(
        (item) => item.policy_id !== itemId,
      );
      if (next.length === record.detail.insurancePolicies.length) return false;
      record.detail.insurancePolicies = next;
      return true;
    }
  }
}
