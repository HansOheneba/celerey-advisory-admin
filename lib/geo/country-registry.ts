/** ISO codes and map coordinates for countries used in the demo book. */
export type CountryGeo = {
  iso3: string;
  iso2: string;
  label: string;
  /** Name on the world-atlas 110m `countries` layer (when it differs from label). */
  atlasName?: string;
  centroid: [number, number];
  flag: string;
};

const REGISTRY: Record<string, CountryGeo> = {
  "United Kingdom": {
    iso3: "GBR",
    iso2: "GB",
    label: "United Kingdom",
    centroid: [-2.5, 54.5],
    flag: "🇬🇧",
  },
  Ghana: {
    iso3: "GHA",
    iso2: "GH",
    label: "Ghana",
    centroid: [-1.02, 7.95],
    flag: "🇬🇭",
  },
  "United States": {
    iso3: "USA",
    iso2: "US",
    label: "United States",
    atlasName: "United States of America",
    centroid: [-98, 39],
    flag: "🇺🇸",
  },
  Nigeria: {
    iso3: "NGA",
    iso2: "NG",
    label: "Nigeria",
    centroid: [8.68, 9.08],
    flag: "🇳🇬",
  },
  "United Arab Emirates": {
    iso3: "ARE",
    iso2: "AE",
    label: "United Arab Emirates",
    centroid: [54.37, 24.47],
    flag: "🇦🇪",
  },
  France: {
    iso3: "FRA",
    iso2: "FR",
    label: "France",
    centroid: [2.21, 46.23],
    flag: "🇫🇷",
  },
  Switzerland: {
    iso3: "CHE",
    iso2: "CH",
    label: "Switzerland",
    centroid: [8.23, 46.82],
    flag: "🇨🇭",
  },
  Kenya: {
    iso3: "KEN",
    iso2: "KE",
    label: "Kenya",
    centroid: [37.91, 0.02],
    flag: "🇰🇪",
  },
  "South Africa": {
    iso3: "ZAF",
    iso2: "ZA",
    label: "South Africa",
    centroid: [25.08, -29.0],
    flag: "🇿🇦",
  },
  Canada: {
    iso3: "CAN",
    iso2: "CA",
    label: "Canada",
    centroid: [-106.0, 56.0],
    flag: "🇨🇦",
  },
};

/** City-level coordinates for property markers. Falls back to country centroid. */
const CITY_COORDS: Record<string, [number, number]> = {
  London: [-0.1278, 51.5074],
  Manchester: [-2.2426, 53.4808],
  Accra: [-0.187, 5.6037],
  Kumasi: [-1.6244, 6.6885],
  Dubai: [55.2708, 25.2048],
  Lagos: [3.3792, 6.5244],
  "New York": [-74.006, 40.7128],
  Geneva: [6.1432, 46.2044],
  Nairobi: [36.8219, -1.2921],
  Johannesburg: [28.0473, -26.2041],
  Toronto: [-79.3832, 43.6532],
};

export function resolveCountryGeo(country: string): CountryGeo | null {
  return REGISTRY[country] ?? null;
}

export function resolveCoordinates(
  country: string,
  city?: string | null,
): [number, number] | null {
  if (city && CITY_COORDS[city]) {
    return CITY_COORDS[city];
  }

  const geo = resolveCountryGeo(country);
  return geo ? geo.centroid : null;
}

export function countryIso3(country: string): string | null {
  return resolveCountryGeo(country)?.iso3 ?? null;
}

/** Property `name` on world-atlas countries-110m geographies. */
export function countryAtlasName(country: string): string | null {
  const geo = resolveCountryGeo(country);
  if (!geo) {
    return null;
  }

  return geo.atlasName ?? geo.label;
}

export function countryFlag(country: string): string {
  return resolveCountryGeo(country)?.flag ?? "🌍";
}
