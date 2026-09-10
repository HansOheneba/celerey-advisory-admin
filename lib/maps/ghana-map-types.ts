/** Canonical Ghana region names aligned with GeoJSON `properties.name`. */
export type GhanaRegionName =
  | "Greater Accra"
  | "Ashanti"
  | "Bono"
  | "Bono East"
  | "Ahafo"
  | "Central"
  | "Eastern"
  | "Northern"
  | "Upper East"
  | "Upper West"
  | "Volta"
  | "Western"
  | "Western North"
  | "Oti"
  | "Savannah"
  | "North East";

/** Two-letter region codes used across the application. */
export type GhanaRegionCode =
  | "AA"
  | "AH"
  | "BO"
  | "BE"
  | "AF"
  | "CP"
  | "EP"
  | "NP"
  | "UE"
  | "UW"
  | "TV"
  | "WP"
  | "WN"
  | "OT"
  | "SV"
  | "NE";

export type RegionData = {
  /** Region display name or code — normalized internally. */
  region: string;
  value: number;
};

export type GhanaRegionFeatureProperties = {
  code: GhanaRegionCode;
  name: GhanaRegionName;
  iso?: string;
  value?: number;
};

export const GHANA_REGION_CODE_TO_NAME: Record<GhanaRegionCode, GhanaRegionName> =
  {
    AA: "Greater Accra",
    AH: "Ashanti",
    BO: "Bono",
    BE: "Bono East",
    AF: "Ahafo",
    CP: "Central",
    EP: "Eastern",
    NP: "Northern",
    UE: "Upper East",
    UW: "Upper West",
    TV: "Volta",
    WP: "Western",
    WN: "Western North",
    OT: "Oti",
    SV: "Savannah",
    NE: "North East",
  };

export const GHANA_REGION_NAME_TO_CODE: Record<GhanaRegionName, GhanaRegionCode> =
  Object.fromEntries(
    Object.entries(GHANA_REGION_CODE_TO_NAME).map(([code, name]) => [
      name,
      code,
    ]),
  ) as Record<GhanaRegionName, GhanaRegionCode>;

/** Legacy codes from pre-2019 region splits. */
const LEGACY_REGION_CODES: Record<string, GhanaRegionCode> = {
  BA: "BO",
};

export function normalizeGhanaRegionCode(
  input: string | null | undefined,
): GhanaRegionCode | null {
  if (input == null) {
    return null;
  }
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const upper = trimmed.toUpperCase();
  if (upper in GHANA_REGION_CODE_TO_NAME) {
    return upper as GhanaRegionCode;
  }
  if (upper in LEGACY_REGION_CODES) {
    return LEGACY_REGION_CODES[upper];
  }

  const byName = GHANA_REGION_NAME_TO_CODE[trimmed as GhanaRegionName];
  if (byName) {
    return byName;
  }

  const withoutSuffix = trimmed.replace(/\s+Region$/i, "");
  return GHANA_REGION_NAME_TO_CODE[withoutSuffix as GhanaRegionName] ?? null;
}

export function normalizeGhanaRegionName(
  input: string,
): GhanaRegionName | null {
  const code = normalizeGhanaRegionCode(input);
  return code ? GHANA_REGION_CODE_TO_NAME[code] : null;
}

export const GHANA_REGIONS_GEOJSON_URL = "/maps/ghana-regions.geojson";

export const GHANA_MAP_LAYER_IDS = {
  source: "ghana-regions",
  fill: "ghana-regions-fill",
  outline: "ghana-regions-outline",
  hoverFill: "ghana-regions-hover-fill",
  selectedFill: "ghana-regions-selected-fill",
  selectedOutline: "ghana-regions-selected-outline",
  markers: "ghana-markers",
} as const;
