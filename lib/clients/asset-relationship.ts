/**
 * Asset relationship classification for Celerey advisory clients.
 *
 * Definitions:
 * - AUA (Assets Under Advice): assets Celerey advises on or includes in planning,
 *   but does not manage under a discretionary mandate.
 * - AUM (Assets Under Management): assets Celerey actively manages.
 * - Total assets covered: aua + aum. Never label this "Total AUM".
 *
 * Demo demarcation rules (tune for business):
 * - Account at institution containing "Celerey" → AUM
 * - Account at any other institution → AUA
 * - Holding default → AUM (Celerey-managed portfolio sleeves)
 * - Holding explicitly marked relationship: "aua" in seed → AUA
 * - heldAwayUsd on client record → AUA (synthetic advised external pool)
 * - Property, liabilities, unadvised personal assets → excluded from covered totals
 */

import type { DemoClientRecord } from "@/lib/demo/types";

export type AssetRelationship = "aua" | "aum";

export type AssetRelationshipKind = "aua" | "aum" | "aua+aum" | "none";

export type ClientAssetTotals = {
  aua: number;
  aum: number;
  totalCovered: number;
};

export const ASSET_RELATIONSHIP_SHORT_LABELS: Record<AssetRelationship, string> =
  {
    aua: "AUA",
    aum: "AUM",
  };

export const ASSET_RELATIONSHIP_LONG_LABELS: Record<AssetRelationship, string> =
  {
    aua: "Assets Under Advice",
    aum: "Assets Under Management",
  };

export const ASSET_RELATIONSHIP_HINTS: Record<AssetRelationship, string> = {
  aua: "Advised but held outside Celerey-managed portfolios",
  aum: "Managed through Celerey",
};

const CELEREY_INSTITUTION_PATTERN = /celerey/i;

function round(value: number): number {
  return Math.round(value);
}

export function totalAssetsCovered(aua: number, aum: number): number {
  return aua + aum;
}

export function deriveRelationshipKind(
  aua: number,
  aum: number,
): AssetRelationshipKind {
  if (aua > 0 && aum > 0) {
    return "aua+aum";
  }
  if (aua > 0) {
    return "aua";
  }
  if (aum > 0) {
    return "aum";
  }
  return "none";
}

export function formatRelationshipLabel(aua: number, aum: number): string {
  const kind = deriveRelationshipKind(aua, aum);
  switch (kind) {
    case "aua+aum":
      return "AUA + AUM";
    case "aua":
      return "AUA";
    case "aum":
      return "AUM";
    default:
      return "None";
  }
}

export function classifyAccountRelationship(
  institution: string,
  explicit?: AssetRelationship,
): AssetRelationship {
  if (explicit) {
    return explicit;
  }
  return CELEREY_INSTITUTION_PATTERN.test(institution) ? "aum" : "aua";
}

export function classifyHoldingRelationship(
  explicit?: AssetRelationship,
): AssetRelationship {
  return explicit ?? "aum";
}

type AssetPool = {
  value: number;
  relationship: AssetRelationship;
};

export function computeAssetTotalsFromPools(
  pools: AssetPool[],
  heldAwayUsd = 0,
): ClientAssetTotals {
  let aua = 0;
  let aum = 0;

  for (const pool of pools) {
    if (pool.relationship === "aua") {
      aua += pool.value;
    } else {
      aum += pool.value;
    }
  }

  aua += heldAwayUsd;

  const roundedAua = round(aua);
  const roundedAum = round(aum);

  return {
    aua: roundedAua,
    aum: roundedAum,
    totalCovered: roundedAua + roundedAum,
  };
}

export function computeClientAssetTotals(
  record: Pick<DemoClientRecord, "detail" | "heldAwayUsd">,
): ClientAssetTotals {
  const pools: AssetPool[] = [];

  for (const holding of record.detail.holdings) {
    pools.push({
      value: holding.current_value ?? 0,
      relationship: classifyHoldingRelationship(
        holding.relationship as AssetRelationship | undefined,
      ),
    });
  }

  for (const account of record.detail.accounts) {
    pools.push({
      value: account.balance,
      relationship: classifyAccountRelationship(
        account.institution,
        account.relationship as AssetRelationship | undefined,
      ),
    });
  }

  return computeAssetTotalsFromPools(pools, record.heldAwayUsd);
}

export function syncAssetRelationshipsOnRecord(record: DemoClientRecord): void {
  for (const holding of record.detail.holdings) {
    holding.relationship = classifyHoldingRelationship(
      holding.relationship as AssetRelationship | undefined,
    );
  }

  for (const account of record.detail.accounts) {
    account.relationship = classifyAccountRelationship(
      account.institution,
      account.relationship as AssetRelationship | undefined,
    );
  }
}

export function applyClientAssetTotals(record: DemoClientRecord): ClientAssetTotals {
  syncAssetRelationshipsOnRecord(record);
  const totals = computeClientAssetTotals(record);
  record.client.aua = totals.aua;
  record.client.aum = totals.aum;
  return totals;
}
