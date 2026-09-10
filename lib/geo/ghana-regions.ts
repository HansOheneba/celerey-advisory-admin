import { COUNTRY_STATES } from "@/lib/clients/location-options";
import {
  GHANA_REGION_CODE_TO_NAME,
  normalizeGhanaRegionCode,
  type GhanaRegionCode,
  type GhanaRegionName,
} from "@/lib/maps/ghana-map-types";

/** Region code → approximate centroid [lng, lat] for map markers. */
const REGION_CENTROIDS: Record<GhanaRegionCode, [number, number]> = {
  AA: [-0.187, 5.6037],
  AH: [-1.6244, 6.6885],
  BO: [-2.3288, 7.3399],
  BE: [-1.9397, 7.5904],
  AF: [-2.5167, 6.8167],
  CP: [-1.2797, 5.1053],
  EP: [-0.2598, 6.0944],
  NP: [-0.8393, 9.4034],
  UE: [-0.8514, 10.7855],
  UW: [-2.5016, 10.0601],
  TV: [0.4713, 6.611],
  WP: [-1.7597, 4.8845],
  WN: [-2.75, 6.2],
  OT: [0.0833, 7.75],
  SV: [-1.8167, 9.0833],
  NE: [-0.5167, 10.5167],
};

/** City → region code for Ghana-resident clients without explicit regionCode. */
const CITY_TO_REGION: Record<string, GhanaRegionCode> = {
  Accra: "AA",
  Tema: "AA",
  Madina: "AA",
  Kumasi: "AH",
  Obuasi: "AH",
  Sunyani: "BO",
  Techiman: "BE",
  Goaso: "AF",
  "Cape Coast": "CP",
  Winneba: "CP",
  Koforidua: "EP",
  Akosombo: "EP",
  Tamale: "NP",
  Bolgatanga: "UE",
  Wa: "UW",
  Ho: "TV",
  Hohoe: "TV",
  Takoradi: "WP",
  Sekondi: "WP",
  Bibiani: "WN",
  "Sefwi Wiawso": "WN",
  Dambai: "OT",
  Damongo: "SV",
  Nalerigu: "NE",
  Jasikan: "OT",
  Kintampo: "BE",
};

export type GhanaRegion = {
  code: GhanaRegionCode;
  label: GhanaRegionName;
  centroid: [number, number];
};

export function ghanaRegions(): GhanaRegion[] {
  return (COUNTRY_STATES.GH ?? []).map((entry) => ({
    code: entry.value as GhanaRegionCode,
    label: entry.label as GhanaRegionName,
    centroid: REGION_CENTROIDS[entry.value as GhanaRegionCode] ?? [-1.02, 7.95],
  }));
}

export function ghanaRegionLabel(code: string): string {
  const normalized = normalizeGhanaRegionCode(code);
  if (normalized) {
    return GHANA_REGION_CODE_TO_NAME[normalized];
  }
  return (
    COUNTRY_STATES.GH?.find((entry) => entry.value === code)?.label ?? code
  );
}

export function resolveGhanaRegionCode(input: {
  regionCode?: string | null;
  city?: string | null;
}): GhanaRegionCode | null {
  if (input.regionCode?.trim()) {
    const fromCode = normalizeGhanaRegionCode(input.regionCode);
    if (fromCode) {
      return fromCode;
    }
  }

  const city = input.city?.trim();
  if (city && city in CITY_TO_REGION) {
    return CITY_TO_REGION[city];
  }

  return null;
}

export function resolveGhanaCoordinates(input: {
  regionCode?: string | null;
  city?: string | null;
}): [number, number] | null {
  const code = resolveGhanaRegionCode(input);
  if (code) {
    return REGION_CENTROIDS[code];
  }

  const city = input.city?.trim();
  if (city && city in CITY_TO_REGION) {
    return REGION_CENTROIDS[CITY_TO_REGION[city]];
  }

  return null;
}
