/** Asset holding rules aligned with celerey-client-frontend (admin create contract). */

import type { ASSET_TYPES } from "@/lib/clients/creation-options";

export type AssetType = (typeof ASSET_TYPES)[number]["value"];

export type ValuationMethod = "market" | "auto_calculated" | "manual";

export type SymbolOption = {
  symbol: string;
  name: string;
};

/** Mirrors POPULAR_SYMBOLS in the client app. There is no ticker search API. */
const SYMBOL_CATALOG: Record<
  "stock" | "etf" | "mutual_fund" | "crypto",
  readonly SymbolOption[]
> = {
  stock: [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "JNJ", name: "Johnson & Johnson" },
    { symbol: "WMT", name: "Walmart Inc." },
    { symbol: "PG", name: "Procter & Gamble Co." },
    { symbol: "MA", name: "Mastercard Inc." },
    { symbol: "UNH", name: "UnitedHealth Group Inc." },
    { symbol: "KO", name: "Coca-Cola Co." },
    { symbol: "DIS", name: "Walt Disney Co." },
    { symbol: "NFLX", name: "Netflix Inc." },
    { symbol: "AMD", name: "Advanced Micro Devices Inc." },
    { symbol: "PYPL", name: "PayPal Holdings Inc." },
    { symbol: "INTC", name: "Intel Corp." },
  ],
  etf: [
    { symbol: "VOO", name: "Vanguard S&P 500 ETF" },
    { symbol: "VTI", name: "Vanguard Total Stock Market ETF" },
    { symbol: "QQQ", name: "Invesco QQQ Trust" },
    { symbol: "SPY", name: "SPDR S&P 500 ETF Trust" },
    { symbol: "IWM", name: "iShares Russell 2000 ETF" },
    { symbol: "VEA", name: "Vanguard FTSE Developed Markets ETF" },
    { symbol: "VWO", name: "Vanguard FTSE Emerging Markets ETF" },
    { symbol: "BND", name: "Vanguard Total Bond Market ETF" },
    { symbol: "ARKK", name: "ARK Innovation ETF" },
    { symbol: "GLD", name: "SPDR Gold Shares" },
    { symbol: "VNQ", name: "Vanguard Real Estate ETF" },
    { symbol: "SCHD", name: "Schwab US Dividend Equity ETF" },
  ],
  mutual_fund: [
    { symbol: "VFIAX", name: "Vanguard 500 Index Fund Admiral" },
    { symbol: "FXAIX", name: "Fidelity 500 Index Fund" },
    { symbol: "VTSAX", name: "Vanguard Total Stock Market Index Admiral" },
    { symbol: "VBTLX", name: "Vanguard Total Bond Market Index Admiral" },
    { symbol: "VWELX", name: "Vanguard Wellington Fund" },
    { symbol: "SWPPX", name: "Schwab S&P 500 Index Fund" },
  ],
  crypto: [
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "SOL", name: "Solana" },
    { symbol: "BNB", name: "BNB" },
    { symbol: "XRP", name: "XRP" },
    { symbol: "ADA", name: "Cardano" },
    { symbol: "DOGE", name: "Dogecoin" },
    { symbol: "AVAX", name: "Avalanche" },
    { symbol: "DOT", name: "Polkadot" },
    { symbol: "MATIC", name: "Polygon" },
  ],
};

/** Crypto symbols the client dashboard can price live via CoinGecko. */
const COINGECKO_MAPPED_SYMBOLS = new Set([
  "BTC",
  "ETH",
  "SOL",
  "BNB",
  "XRP",
  "ADA",
  "DOGE",
  "AVAX",
  "DOT",
  "MATIC",
]);

/** Market types are priced from a feed rather than a typed-in valuation. */
export function isMarketAssetType(assetType: AssetType): boolean {
  return assetType === "stock" || assetType === "etf" || assetType === "crypto";
}

/** Mutual funds accept an optional ticker; market types require one. */
export function supportsSymbol(assetType: AssetType): boolean {
  return isMarketAssetType(assetType) || assetType === "mutual_fund";
}

export function symbolsForType(assetType: AssetType): readonly SymbolOption[] {
  if (!supportsSymbol(assetType)) {
    return [];
  }
  return SYMBOL_CATALOG[assetType as keyof typeof SYMBOL_CATALOG];
}

export function findSymbolOption(
  assetType: AssetType,
  symbol: string,
): SymbolOption | undefined {
  const normalized = symbol.trim().toUpperCase();
  return symbolsForType(assetType).find(
    (option) => option.symbol === normalized,
  );
}

export function hasLiveCryptoPrice(assetType: AssetType, symbol: string): boolean {
  return (
    assetType === "crypto" &&
    COINGECKO_MAPPED_SYMBOLS.has(symbol.trim().toUpperCase())
  );
}

export function deriveValuationMethod(
  assetType: AssetType,
  symbol: string,
  couponRate: number | null,
): ValuationMethod {
  if (isMarketAssetType(assetType)) {
    return "market";
  }
  if (assetType === "mutual_fund") {
    return symbol.trim() ? "market" : "manual";
  }
  if (assetType === "bond") {
    return "auto_calculated";
  }
  if (assetType === "cash") {
    return couponRate != null && couponRate > 0 ? "auto_calculated" : "manual";
  }
  return "manual";
}

export function valuationMethodLabel(method: ValuationMethod): string {
  switch (method) {
    case "market":
      return "Live / market priced";
    case "auto_calculated":
      return "Auto-calculated";
    case "manual":
      return "Manual valuation";
  }
}

export function assetTypeLabel(assetType: string): string {
  return assetType.replaceAll("_", " ");
}

/** Maps create-form snake_case keys to profile editor camelCase field names. */
const PROFILE_HOLDING_FIELD_NAMES: Record<string, string> = {
  asset_type: "assetType",
  cost_basis: "costBasis",
  current_value: "currentValue",
  initial_value_date: "initialValueDate",
  coupon_rate: "couponRate",
  maturity_date: "maturityDate",
  last_updated: "lastUpdated",
  valuation_method: "valuationMethod",
  amount_invested: "amountInvested",
};

export function profileHoldingFieldName(key: string): string {
  return PROFILE_HOLDING_FIELD_NAMES[key] ?? key;
}
