import type { HoldingSpec, MoneySpec } from "@/lib/demo/seed/client-builder";

type Sleeve = {
  name: string;
  symbol?: string;
  assetType: string;
  weight: number;
  gainPct: number;
};

export function holdingsFrom(total: number, sleeves: Sleeve[]): HoldingSpec[] {
  return sleeves.map((sleeve) => {
    const value = Math.round(total * sleeve.weight);
    return {
      name: sleeve.name,
      symbol: sleeve.symbol,
      assetType: sleeve.assetType,
      value,
      costBasis: Math.round(value / (1 + sleeve.gainPct / 100)),
    };
  });
}

export const GROWTH_SLEEVES: Sleeve[] = [
  { name: "Global Equity Core", symbol: "GEC", assetType: "Equities", weight: 0.38, gainPct: 22 },
  { name: "Emerging Markets Fund", symbol: "EMF", assetType: "Equities", weight: 0.14, gainPct: 11 },
  { name: "Investment Grade Credit", symbol: "IGC", assetType: "Fixed income", weight: 0.2, gainPct: 5 },
  { name: "Private Markets Access", assetType: "Private markets", weight: 0.16, gainPct: 34 },
  { name: "Gold & Commodities", symbol: "GLD", assetType: "Alternatives", weight: 0.12, gainPct: 14 },
];

export const BALANCED_SLEEVES: Sleeve[] = [
  { name: "Global Equity Core", symbol: "GEC", assetType: "Equities", weight: 0.3, gainPct: 18 },
  { name: "Sovereign Bond Ladder", symbol: "SBL", assetType: "Fixed income", weight: 0.32, gainPct: 4 },
  { name: "Investment Grade Credit", symbol: "IGC", assetType: "Fixed income", weight: 0.16, gainPct: 6 },
  { name: "Diversified Property Fund", assetType: "Real estate", weight: 0.12, gainPct: 9 },
  { name: "Absolute Return Fund", assetType: "Alternatives", weight: 0.1, gainPct: 7 },
];

export const INCOME_SLEEVES: Sleeve[] = [
  { name: "Sovereign Bond Ladder", symbol: "SBL", assetType: "Fixed income", weight: 0.4, gainPct: 3 },
  { name: "Investment Grade Credit", symbol: "IGC", assetType: "Fixed income", weight: 0.26, gainPct: 5 },
  { name: "Dividend Equity Income", symbol: "DEI", assetType: "Equities", weight: 0.2, gainPct: 12 },
  { name: "Diversified Property Fund", assetType: "Real estate", weight: 0.14, gainPct: 8 },
];

export const AGGRESSIVE_SLEEVES: Sleeve[] = [
  { name: "Global Equity Core", symbol: "GEC", assetType: "Equities", weight: 0.34, gainPct: 27 },
  { name: "Technology Growth Fund", symbol: "TGF", assetType: "Equities", weight: 0.22, gainPct: 41 },
  { name: "Private Markets Access", assetType: "Private markets", weight: 0.24, gainPct: 38 },
  { name: "Digital Asset Sleeve", assetType: "Alternatives", weight: 0.1, gainPct: 55 },
  { name: "Investment Grade Credit", symbol: "IGC", assetType: "Fixed income", weight: 0.1, gainPct: 4 },
];

export function incomeFor(monthly: number): MoneySpec[] {
  return [
    { name: "Employment income", amount: Math.round(monthly * 0.6) },
    { name: "Portfolio distributions", amount: Math.round(monthly * 0.27) },
    { name: "Rental income", amount: Math.round(monthly * 0.13) },
  ];
}

export function expensesFor(monthly: number): MoneySpec[] {
  return [
    { name: "Household", amount: Math.round(monthly * 0.34), essential: true },
    { name: "Education", amount: Math.round(monthly * 0.18), essential: true },
    { name: "Travel & lifestyle", amount: Math.round(monthly * 0.24) },
    { name: "Insurance & health", amount: Math.round(monthly * 0.12), essential: true },
    { name: "Philanthropy", amount: Math.round(monthly * 0.12) },
  ];
}
