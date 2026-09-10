import {
  countryFlag,
  countryIso3,
  resolveCoordinates,
} from "@/lib/geo/country-registry";
import {
  ghanaRegionLabel,
  ghanaRegions,
  resolveGhanaRegionCode,
} from "@/lib/geo/ghana-regions";
import type { GhanaRegionCode } from "@/lib/maps/ghana-map-types";
import type { DemoClientRecord } from "@/lib/demo/types";

export type AgeBucket = {
  label: string;
  min: number;
  max: number;
  count: number;
  aua: number;
  aum: number;
  totalCovered: number;
};

export type AgeAnalytics = {
  averageAge: number;
  medianAge: number;
  youngest: number;
  oldest: number;
  withAgeCount: number;
  buckets: AgeBucket[];
};

export type PropertyMarker = {
  id: string;
  name: string;
  city: string;
  country: string;
  value: number;
  coordinates: [number, number];
  clientName: string;
};

export type CountrySpread = {
  country: string;
  iso3: string | null;
  flag: string;
  propertyCount: number;
  clientCount: number;
  valueUsd: number;
  sharePct: number;
  coordinates: [number, number];
};

export type GeographicSpread = {
  totalPropertyValue: number;
  propertyCount: number;
  countryCount: number;
  countries: CountrySpread[];
  markers: PropertyMarker[];
};

export type ResidencySpread = {
  totalAua: number;
  totalAum: number;
  totalCovered: number;
  countryCount: number;
  countries: Array<{
    country: string;
    iso3: string | null;
    clientCount: number;
    aua: number;
    aum: number;
    totalCovered: number;
    sharePct: number;
  }>;
};

const AGE_BUCKETS: Array<{ label: string; min: number; max: number }> = [
  { label: "Under 40", min: 0, max: 39 },
  { label: "40–49", min: 40, max: 49 },
  { label: "50–59", min: 50, max: 59 },
  { label: "60–69", min: 60, max: 69 },
  { label: "70+", min: 70, max: 120 },
];

function ageFromRecord(record: DemoClientRecord): number | null {
  const dob = record.detail.user.date_of_birth;
  if (dob) {
    const birth = Date.parse(dob);
    if (Number.isFinite(birth)) {
      const today = new Date();
      let age = today.getFullYear() - new Date(dob).getFullYear();
      const monthDelta = today.getMonth() - new Date(dob).getMonth();
      if (
        monthDelta < 0 ||
        (monthDelta === 0 && today.getDate() < new Date(dob).getDate())
      ) {
        age -= 1;
      }
      if (age > 0 && age < 120) {
        return age;
      }
    }
  }

  const retirementAge = record.detail.retirement?.currentAge;
  if (typeof retirementAge === "number" && retirementAge > 0) {
    return retirementAge;
  }

  return null;
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

export function computeAgeAnalytics(records: DemoClientRecord[]): AgeAnalytics {
  const ages: number[] = [];
  const buckets: AgeBucket[] = AGE_BUCKETS.map((bucket) => ({
    ...bucket,
    count: 0,
    aua: 0,
    aum: 0,
    totalCovered: 0,
  }));

  for (const record of records) {
    const age = ageFromRecord(record);
    if (age === null) {
      continue;
    }

    ages.push(age);

    const bucket =
      buckets.find((entry) => age >= entry.min && age <= entry.max) ??
      buckets[buckets.length - 1];
    bucket.count += 1;
    bucket.aua += record.client.aua;
    bucket.aum += record.client.aum;
    bucket.totalCovered += record.client.aua + record.client.aum;
  }

  return {
    averageAge:
      ages.length > 0
        ? Math.round(ages.reduce((total, age) => total + age, 0) / ages.length)
        : 0,
    medianAge: median(ages),
    youngest: ages.length > 0 ? Math.min(...ages) : 0,
    oldest: ages.length > 0 ? Math.max(...ages) : 0,
    withAgeCount: ages.length,
    buckets,
  };
}

export function computeResidencySpread(
  records: DemoClientRecord[],
): ResidencySpread {
  const byCountry = new Map<
    string,
    { clientCount: number; aua: number; aum: number }
  >();

  for (const record of records) {
    const country =
      record.detail.user.resident_country?.trim() ||
      record.client.location.split(",")[0]?.trim() ||
      "Unknown";

    const existing = byCountry.get(country);
    if (existing) {
      existing.clientCount += 1;
      existing.aua += record.client.aua;
      existing.aum += record.client.aum;
    } else {
      byCountry.set(country, {
        clientCount: 1,
        aua: record.client.aua,
        aum: record.client.aum,
      });
    }
  }

  const totalAua = [...byCountry.values()].reduce(
    (total, entry) => total + entry.aua,
    0,
  );
  const totalAum = [...byCountry.values()].reduce(
    (total, entry) => total + entry.aum,
    0,
  );
  const totalCovered = totalAua + totalAum;

  const countries = [...byCountry.entries()]
    .map(([country, stats]) => ({
      country,
      iso3: countryIso3(country),
      clientCount: stats.clientCount,
      aua: stats.aua,
      aum: stats.aum,
      totalCovered: stats.aua + stats.aum,
      sharePct:
        totalCovered > 0
          ? Math.round(((stats.aua + stats.aum) / totalCovered) * 100)
          : 0,
    }))
    .sort((a, b) => b.totalCovered - a.totalCovered);

  return {
    totalAua,
    totalAum,
    totalCovered,
    countryCount: countries.length,
    countries,
  };
}

function residentClientsByCountry(
  records: DemoClientRecord[],
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const record of records) {
    const country =
      record.detail.user.resident_country?.trim() ||
      record.client.location.split(",")[0]?.trim() ||
      "Unknown";
    counts.set(country, (counts.get(country) ?? 0) + 1);
  }

  return counts;
}

export function computeGeographicSpread(
  records: DemoClientRecord[],
): GeographicSpread {
  const residentsByCountry = residentClientsByCountry(records);
  const byCountry = new Map<
    string,
    {
      propertyCount: number;
      clientIds: Set<string>;
      valueUsd: number;
      coordinates: [number, number];
    }
  >();
  const markers: PropertyMarker[] = [];

  for (const record of records) {
    const clientName = `${record.client.firstName} ${record.client.lastName}`;

    for (const property of record.detail.propertyAssets) {
      const value = property.current_value ?? property.purchase_price ?? 0;
      if (value <= 0) {
        continue;
      }

      const country = property.country?.trim() || "Unknown";
      const city = property.city?.trim() || country;
      const coordinates = resolveCoordinates(country, city);

      if (!coordinates) {
        continue;
      }

      markers.push({
        id: property.property_id,
        name: property.name,
        city,
        country,
        value,
        coordinates,
        clientName,
      });

      const existing = byCountry.get(country);
      if (existing) {
        existing.propertyCount += 1;
        existing.clientIds.add(record.client.id);
        existing.valueUsd += value;
      } else {
        byCountry.set(country, {
          propertyCount: 1,
          clientIds: new Set([record.client.id]),
          valueUsd: value,
          coordinates: resolveCoordinates(country) ?? coordinates,
        });
      }
    }
  }

  const totalPropertyValue = markers.reduce(
    (total, marker) => total + marker.value,
    0,
  );

  const countries: CountrySpread[] = [...byCountry.entries()]
    .map(([country, stats]) => ({
      country,
      iso3: countryIso3(country),
      flag: countryFlag(country),
      propertyCount: stats.propertyCount,
      clientCount: residentsByCountry.get(country) ?? stats.clientIds.size,
      valueUsd: stats.valueUsd,
      sharePct:
        totalPropertyValue > 0
          ? Math.round((stats.valueUsd / totalPropertyValue) * 100)
          : 0,
      coordinates: stats.coordinates,
    }))
    .sort((a, b) => b.valueUsd - a.valueUsd);

  return {
    totalPropertyValue,
    propertyCount: markers.length,
    countryCount: countries.length,
    countries,
    markers,
  };
}

export type GhanaClientMarker = {
  id: string;
  clientName: string;
  city: string;
  regionCode: GhanaRegionCode;
  aua: number;
  aum: number;
  totalCovered: number;
  coordinates: [number, number];
};

export type GhanaRegionSpread = {
  code: GhanaRegionCode;
  label: string;
  clientCount: number;
  aua: number;
  aum: number;
  totalCovered: number;
  sharePct: number;
  centroid: [number, number];
};

export type GhanaRegionalSpread = {
  totalClients: number;
  totalAua: number;
  totalAum: number;
  totalCovered: number;
  regions: GhanaRegionSpread[];
  markers: GhanaClientMarker[];
};

function isGhanaResident(record: DemoClientRecord): boolean {
  const country =
    record.detail.user.resident_country?.trim() ||
    record.client.location.split(",").pop()?.trim() ||
    "";
  return country === "Ghana" || record.client.location.includes("Ghana");
}

export function computeGhanaRegionalSpread(
  records: DemoClientRecord[],
): GhanaRegionalSpread {
  const regionMeta = new Map(
    ghanaRegions().map((region) => [region.code, region]),
  );
  const byRegion = new Map<
    GhanaRegionCode,
    { clientCount: number; aua: number; aum: number }
  >();
  const markers: GhanaClientMarker[] = [];

  for (const region of ghanaRegions()) {
    byRegion.set(region.code, { clientCount: 0, aua: 0, aum: 0 });
  }

  for (const record of records) {
    if (!isGhanaResident(record)) {
      continue;
    }

    const regionCode =
      resolveGhanaRegionCode({
        regionCode: record.detail.user.resident_state,
        city: record.detail.user.city ?? record.client.location.split(",")[0],
      }) ?? "AA";

    const meta = regionMeta.get(regionCode);
    if (!meta) {
      continue;
    }

    const stats = byRegion.get(regionCode);
    if (stats) {
      stats.clientCount += 1;
      stats.aua += record.client.aua;
      stats.aum += record.client.aum;
    }

    markers.push({
      id: record.client.id,
      clientName: `${record.client.firstName} ${record.client.lastName}`,
      city: record.detail.user.city ?? "",
      regionCode,
      aua: record.client.aua,
      aum: record.client.aum,
      totalCovered: record.client.aua + record.client.aum,
      coordinates: meta.centroid,
    });
  }

  const totalAua = markers.reduce((total, marker) => total + marker.aua, 0);
  const totalAum = markers.reduce((total, marker) => total + marker.aum, 0);
  const totalCovered = totalAua + totalAum;

  const regions: GhanaRegionSpread[] = [...byRegion.entries()]
    .map(([code, stats]) => {
      const meta = regionMeta.get(code);
      const regionTotalCovered = stats.aua + stats.aum;
      return {
        code,
        label: meta?.label ?? ghanaRegionLabel(code),
        clientCount: stats.clientCount,
        aua: stats.aua,
        aum: stats.aum,
        totalCovered: regionTotalCovered,
        sharePct:
          totalCovered > 0
            ? Math.round((regionTotalCovered / totalCovered) * 100)
            : 0,
        centroid: meta?.centroid ?? [-1.02, 7.95],
      };
    })
    .filter((region) => region.clientCount > 0)
    .sort((a, b) => b.totalCovered - a.totalCovered);

  return {
    totalClients: markers.length,
    totalAua,
    totalAum,
    totalCovered,
    regions,
    markers,
  };
}
