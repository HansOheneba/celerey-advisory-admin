import {
  countryFlag,
  countryIso3,
  resolveCoordinates,
} from "@/lib/geo/country-registry";
import type { DemoClientRecord } from "@/lib/demo/types";

export type AgeBucket = {
  label: string;
  min: number;
  max: number;
  count: number;
  aua: number;
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
  countryCount: number;
  countries: Array<{
    country: string;
    iso3: string | null;
    clientCount: number;
    aua: number;
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
    { clientCount: number; aua: number }
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
    } else {
      byCountry.set(country, {
        clientCount: 1,
        aua: record.client.aua,
      });
    }
  }

  const totalAua = [...byCountry.values()].reduce(
    (total, entry) => total + entry.aua,
    0,
  );

  const countries = [...byCountry.entries()]
    .map(([country, stats]) => ({
      country,
      iso3: countryIso3(country),
      clientCount: stats.clientCount,
      aua: stats.aua,
      sharePct:
        totalAua > 0 ? Math.round((stats.aua / totalAua) * 100) : 0,
    }))
    .sort((a, b) => b.aua - a.aua);

  return {
    totalAua,
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
