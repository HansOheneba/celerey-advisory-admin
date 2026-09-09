export type ProfileWriteResult =
  | { ok: true }
  | { ok: false; message: string };

export type ProfileCollection =
  | "goals"
  | "holdings"
  | "accounts"
  | "incomeRows"
  | "expenseCategories"
  | "liabilities"
  | "propertyAssets"
  | "insurancePolicies";
