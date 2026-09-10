import { resolveGhanaRegionCode } from "@/lib/geo/ghana-regions";
import type { Client } from "@/types/client";

export type ResidencyProfile = {
  country: string;
  city: string;
  location: string;
  residency: string;
  currency: Client["currency"];
  phone: string;
  citizenships: string[];
  regionCode?: string;
};

const INTERNATIONAL_PROFILES: Record<string, ResidencyProfile> = {
  London: {
    country: "United Kingdom",
    city: "London",
    location: "London, UK",
    residency: "UK resident",
    currency: "GBP",
    phone: "+44 20 7946 0000",
    citizenships: ["GB", "GH"],
  },
  Manchester: {
    country: "United Kingdom",
    city: "Manchester",
    location: "Manchester, UK",
    residency: "UK resident",
    currency: "GBP",
    phone: "+44 161 496 0000",
    citizenships: ["GB", "GH"],
  },
  Lagos: {
    country: "Nigeria",
    city: "Lagos",
    location: "Lagos, Nigeria",
    residency: "NG resident",
    currency: "USD",
    phone: "+234 1 460 0000",
    citizenships: ["NG", "GH"],
  },
  Nairobi: {
    country: "Kenya",
    city: "Nairobi",
    location: "Nairobi, Kenya",
    residency: "KE resident",
    currency: "USD",
    phone: "+254 20 222 0000",
    citizenships: ["KE", "GH"],
  },
  Johannesburg: {
    country: "South Africa",
    city: "Johannesburg",
    location: "Johannesburg, South Africa",
    residency: "ZA resident",
    currency: "USD",
    phone: "+27 11 234 0000",
    citizenships: ["ZA", "GH"],
  },
  "New York": {
    country: "United States",
    city: "New York",
    location: "New York, USA",
    residency: "US resident",
    currency: "USD",
    phone: "+1 212 555 0100",
    citizenships: ["US", "GH"],
  },
  Toronto: {
    country: "Canada",
    city: "Toronto",
    location: "Toronto, Canada",
    residency: "CA resident",
    currency: "USD",
    phone: "+1 416 555 0100",
    citizenships: ["CA", "GH"],
  },
  Dubai: {
    country: "United Arab Emirates",
    city: "Dubai",
    location: "Dubai, UAE",
    residency: "AE resident",
    currency: "USD",
    phone: "+971 4 555 0100",
    citizenships: ["GH", "AE"],
  },
  Geneva: {
    country: "Switzerland",
    city: "Geneva",
    location: "Geneva, Switzerland",
    residency: "CH resident",
    currency: "USD",
    phone: "+41 22 555 0100",
    citizenships: ["CH", "GH"],
  },
};

export function resolveFillerResidency(city: string): ResidencyProfile {
  const international = INTERNATIONAL_PROFILES[city];
  if (international) {
    return international;
  }

  return {
    country: "Ghana",
    city,
    location: `${city}, Ghana`,
    residency: "GH resident",
    currency: "USD",
    phone: "+233 30 200 0000",
    citizenships: ["GH"],
    regionCode: resolveGhanaRegionCode({ city }) ?? undefined,
  };
}

export function timezoneForResidentCountry(country: string): string {
  switch (country) {
    case "United Kingdom":
      return "Europe/London";
    case "United States":
      return "America/New_York";
    case "Canada":
      return "America/Toronto";
    case "United Arab Emirates":
      return "Asia/Dubai";
    case "Nigeria":
      return "Africa/Lagos";
    case "Kenya":
      return "Africa/Nairobi";
    case "South Africa":
      return "Africa/Johannesburg";
    case "Switzerland":
      return "Europe/Zurich";
    default:
      return "Africa/Accra";
  }
}
