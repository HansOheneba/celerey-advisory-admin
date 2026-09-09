import { ADVISOR_COUNTRIES } from "@/lib/settings/options";

export const CLIENT_COUNTRIES = ADVISOR_COUNTRIES;

export const COUNTRY_CURRENCIES: Record<string, string> = {
  GH: "GHS",
  NG: "NGN",
  KE: "KES",
  ZA: "ZAR",
  GB: "GBP",
  US: "USD",
  CA: "CAD",
  AE: "AED",
};

/** Subset of regions used in the client onboarding CSC dataset. */
export const COUNTRY_STATES: Record<
  string,
  readonly { value: string; label: string }[]
> = {
  GH: [
    { value: "AA", label: "Greater Accra" },
    { value: "AH", label: "Ashanti" },
    { value: "BA", label: "Brong-Ahafo" },
    { value: "CP", label: "Central" },
    { value: "EP", label: "Eastern" },
    { value: "NP", label: "Northern" },
    { value: "UE", label: "Upper East" },
    { value: "UW", label: "Upper West" },
    { value: "TV", label: "Volta" },
    { value: "WP", label: "Western" },
  ],
  US: [
    { value: "CA", label: "California" },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
    { value: "IL", label: "Illinois" },
    { value: "MA", label: "Massachusetts" },
    { value: "NY", label: "New York" },
    { value: "TX", label: "Texas" },
    { value: "VA", label: "Virginia" },
    { value: "WA", label: "Washington" },
  ],
  CA: [
    { value: "AB", label: "Alberta" },
    { value: "BC", label: "British Columbia" },
    { value: "MB", label: "Manitoba" },
    { value: "ON", label: "Ontario" },
    { value: "QC", label: "Quebec" },
    { value: "SK", label: "Saskatchewan" },
  ],
  NG: [
    { value: "LA", label: "Lagos" },
    { value: "FC", label: "Abuja (FCT)" },
    { value: "RI", label: "Rivers" },
    { value: "KN", label: "Kano" },
  ],
};

export function countryHasStates(countryCode: string) {
  return countryCode in COUNTRY_STATES;
}

export function currencyForCountry(countryCode: string) {
  return COUNTRY_CURRENCIES[countryCode] ?? "USD";
}

export const ACCOUNT_MODES = [
  { value: "solo", label: "Individual", description: "One person account" },
  {
    value: "partner",
    label: "Partner",
    description: "Household with a partner",
  },
  {
    value: "family",
    label: "Family",
    description: "Household with dependents",
  },
] as const;

export type AccountMode = (typeof ACCOUNT_MODES)[number]["value"];

export const NAME_PREFIXES = ["Mr", "Mrs", "Ms", "Dr", "Prof", "Rev"] as const;

export const GENDER_OPTIONS = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "O", label: "Non-binary / Other" },
  { value: "X", label: "Prefer not to say" },
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
] as const;
