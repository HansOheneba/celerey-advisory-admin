/**
 * Asset relationship classification for Celerey advisory clients.
 *
 * Definitions:
 * - AUA (Assets Under Advice): total assets Celerey advises on, including managed
 *   and advised-only holdings. AUA >= AUM always.
 * - AUM (Assets Under Management): subset of AUA that Celerey actively manages.
 * - Advised-only (held away): AUA − AUM. Never add AUA + AUM — that double-counts.
 *
 * Demo demarcation rules (tune for business):
 * - Account at institution containing "Celerey" → AUM
 * - Account at any other institution → advised-only (counts toward AUA)
 * - Holding default → AUM (Celerey-managed portfolio sleeves)
 * - Holding explicitly marked relationship: "aua" in seed → advised-only
 * - heldAwayUsd on client record → advised-only (synthetic external pool)
 * - Property, liabilities, unadvised personal assets → excluded from AUA/AUM
 */

import type { DemoClientRecord } from "@/lib/demo/types";

export type AssetRelationship = "aua" | "aum";

export type AssetRelationshipKind = "aua" | "aum" | "aua+aum" | "none";

export type ClientAssetTotals = {
  /** Total assets under advice (managed + advised-only). */
  aua: number;
  /** Managed subset of AUA. */
  aum: number;
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
  aua: "Total assets under advice (includes managed)",
  aum: "Actively managed through Celerey",
};

const CELEREY_INSTITUTION_PATTERN = /celerey/i;

function round(value: number): number {
  return Math.round(value);
}

/** Assets advised on but not under Celerey management mandate. */
export function advisedOnlyAssets(aua: number, aum: number): number {
  return Math.max(0, aua - aum);
}

export function deriveRelationshipKind(
  aua: number,
  aum: number,
): AssetRelationshipKind {
  const advisedOnly = advisedOnlyAssets(aua, aum);

  if (aum > 0 && advisedOnly > 0) {
    return "aua+aum";
  }
  if (aum > 0) {
    return "aum";
  }
  if (aua > 0) {
    return "aua";
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
  let advisedOnly = 0;
  let aum = 0;

  for (const pool of pools) {
    if (pool.relationship === "aum") {
      aum += pool.value;
    } else {
      advisedOnly += pool.value;
    }
  }

  advisedOnly += heldAwayUsd;

  const roundedAum = round(aum);
  const roundedAua = round(advisedOnly + aum);

  return {
    aua: roundedAua,
    aum: roundedAum,
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
