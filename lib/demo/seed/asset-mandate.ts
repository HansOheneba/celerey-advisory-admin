import type { AssetRelationship } from "@/lib/clients/asset-relationship";
import type { AccountSpec, ClientSpec, HoldingSpec } from "@/lib/demo/seed/client-builder";

export type AssetMandate = "aua" | "aum" | "mixed";

const CELEREY_PATTERN = /celerey/i;

const EXTERNAL_INSTITUTIONS = [
  "Stanbic Bank",
  "GCB Bank",
  "Ecobank Ghana",
  "Standard Chartered",
  "Fidelity",
  "Charles Schwab",
  "Interactive Brokers",
  "Hargreaves Lansdown",
] as const;

function externalInstitution(key: string): string {
  const index =
    Math.abs(key.split("").reduce((total, char) => total + char.charCodeAt(0), 0)) %
    EXTERNAL_INSTITUTIONS.length;
  return EXTERNAL_INSTITUTIONS[index];
}

function portfolioBase(spec: ClientSpec): number {
  const holdings = spec.holdings.reduce((total, row) => total + row.value, 0);
  const cash = spec.accounts.reduce((total, row) => total + row.balance, 0);
  return holdings + cash;
}

function isMixedBook(spec: ClientSpec): boolean {
  const hasHeldAway = (spec.heldAwayUsd ?? 0) > 0;
  const hasAuaPool =
    spec.holdings.some((holding) => holding.relationship === "aua") ||
    spec.accounts.some(
      (account) =>
        account.relationship === "aua" ||
        (!account.relationship && !CELEREY_PATTERN.test(account.institution)),
    );
  const hasAumPool =
    spec.holdings.some((holding) => holding.relationship !== "aua") ||
    spec.accounts.some(
      (account) =>
        account.relationship === "aum" ||
        (!account.relationship && CELEREY_PATTERN.test(account.institution)),
    );

  return hasHeldAway || (hasAuaPool && hasAumPool);
}

function markHoldingsAua(holdings: HoldingSpec[]): HoldingSpec[] {
  return holdings.map((holding) => ({ ...holding, relationship: "aua" }));
}

function markAccountsAua(accounts: AccountSpec[], key: string): AccountSpec[] {
  return accounts.map((account, index) => ({
    ...account,
    institution: CELEREY_PATTERN.test(account.institution)
      ? externalInstitution(`${key}-${index}`)
      : account.institution,
    relationship: "aua" as AssetRelationship,
  }));
}

function markAccountsAum(accounts: AccountSpec[]): AccountSpec[] {
  return accounts.map((account) => ({
    ...account,
    institution: CELEREY_PATTERN.test(account.institution)
      ? account.institution
      : "Celerey Bank",
    relationship: undefined,
  }));
}

function stripAuaFromHoldings(holdings: HoldingSpec[]): HoldingSpec[] {
  return holdings.map(({ relationship: _relationship, ...holding }) => holding);
}

function ensureMixedBook(spec: ClientSpec): ClientSpec {
  if (isMixedBook(spec)) {
    return spec;
  }

  const holdings = [...spec.holdings];
  if (holdings.length > 0) {
    const smallestIndex = holdings.reduce(
      (minIndex, holding, index, rows) =>
        holding.value < rows[minIndex].value ? index : minIndex,
      0,
    );
    holdings[smallestIndex] = {
      ...holdings[smallestIndex],
      relationship: "aua",
    };
  }

  const base = portfolioBase(spec);
  const externalCash = Math.max(Math.round(base * 0.12), 20_000);
  const celereyAccounts = spec.accounts.filter((account) =>
    CELEREY_PATTERN.test(account.institution),
  );
  const otherAccounts = spec.accounts.filter(
    (account) => !CELEREY_PATTERN.test(account.institution),
  );

  const primaryCelerey = celereyAccounts[0];
  const adjustedAccounts: AccountSpec[] = [];

  if (primaryCelerey) {
    adjustedAccounts.push({
      ...primaryCelerey,
      balance: Math.max(primaryCelerey.balance - externalCash, 0),
    });
  }

  adjustedAccounts.push(
    ...celereyAccounts.slice(1),
    ...otherAccounts.map((account) => ({
      ...account,
      relationship: "aua" as AssetRelationship,
    })),
    {
      name: "External call account",
      institution: externalInstitution(`${spec.id}-mixed`),
      type: "deposit",
      balance: externalCash,
      relationship: "aua",
    },
  );

  return {
    ...spec,
    heldAwayUsd: 0,
    holdings,
    accounts: adjustedAccounts,
  };
}

export function applyAssetMandate(spec: ClientSpec): ClientSpec {
  const mandate = spec.assetMandate ?? "mixed";

  if (mandate === "aua") {
    return {
      ...spec,
      heldAwayUsd: 0,
      holdings: markHoldingsAua(spec.holdings),
      accounts: markAccountsAua(spec.accounts, spec.id),
    };
  }

  if (mandate === "aum") {
    return {
      ...spec,
      heldAwayUsd: 0,
      holdings: stripAuaFromHoldings(spec.holdings),
      accounts: markAccountsAum(spec.accounts),
    };
  }

  return ensureMixedBook({
    ...spec,
    heldAwayUsd: spec.heldAwayUsd ?? 0,
  });
}

export const ASSET_MANDATE_CYCLE: AssetMandate[] = ["aum", "mixed", "aua"];

export function defaultAssetMandate(spec: ClientSpec, index: number): AssetMandate {
  if (spec.assetMandate) {
    return spec.assetMandate;
  }

  if (spec.id.endsWith("-advised")) {
    return "aua";
  }

  return ASSET_MANDATE_CYCLE[index % ASSET_MANDATE_CYCLE.length];
}
