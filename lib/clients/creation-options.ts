/** Dropdown values aligned with docs/admin-client-creation-fields.json */

export const PREFERRED_CONTACT_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

export const RISK_PROFILE_OPTIONS = [
  { value: "conservative", label: "Conservative" },
  { value: "moderate", label: "Moderate" },
  { value: "aggressive", label: "Aggressive" },
] as const;

/** Dashboard cash-flow API stores category lowercased — values match accepts_dashboard. */
export const INCOME_CATEGORIES = [
  { value: "salary", label: "Salary" },
  { value: "freelance", label: "Freelance" },
  { value: "rental", label: "Rental" },
  { value: "dividends", label: "Dividends" },
  { value: "business", label: "Business" },
  { value: "pension", label: "Pension" },
  { value: "other", label: "Other" },
] as const;

export const EXPENSE_CATEGORIES = [
  { value: "housing", label: "Housing" },
  { value: "food", label: "Food" },
  { value: "transport", label: "Transport" },
  { value: "healthcare", label: "Healthcare" },
  { value: "entertainment", label: "Entertainment" },
  { value: "utilities", label: "Utilities" },
  { value: "education", label: "Education" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
] as const;

export const CURRENCY_OPTIONS = [
  { value: "GHS", label: "GHS — Ghanaian cedi" },
  { value: "NGN", label: "NGN — Nigerian naira" },
  { value: "KES", label: "KES — Kenyan shilling" },
  { value: "ZAR", label: "ZAR — South African rand" },
  { value: "GBP", label: "GBP — British pound" },
  { value: "USD", label: "USD — US dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "CAD", label: "CAD — Canadian dollar" },
  { value: "AED", label: "AED — UAE dirham" },
] as const;

export const RECURRING_TYPE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "one-time", label: "One-time" },
] as const;

export const EMERGENCY_FUND_TARGET_MONTHS = [3, 6, 9, 12] as const;

export const EMERGENCY_FUND_STORAGE_OPTIONS = [
  { value: "savings_account", label: "Savings account" },
  { value: "checking_account", label: "Checking account" },
  { value: "money_market", label: "Money market account" },
  { value: "fixed_deposit", label: "Fixed deposit / CD" },
  { value: "physical_cash", label: "Physical cash" },
  { value: "other", label: "Other" },
] as const;

export const RETIREMENT_STORAGE_OPTIONS = [
  { value: "employer_pension", label: "Employer pension / 401(k)" },
  { value: "personal_pension", label: "Personal pension / Traditional IRA" },
  { value: "roth_account", label: "Roth IRA / tax-free account" },
  { value: "brokerage", label: "Stocks & ETFs (taxable brokerage)" },
  { value: "target_date_fund", label: "Target-date / balanced fund" },
  { value: "savings_account", label: "Savings account" },
  { value: "physical_cash", label: "Cash / checking account" },
  { value: "mixed", label: "Split across multiple accounts" },
  { value: "other", label: "Other" },
] as const;

export const GOAL_CATEGORIES = [
  { value: "emergency", label: "Emergency fund", icon: "shield", color: "#EF4444" },
  { value: "retirement", label: "Retirement", icon: "umbrella-beach", color: "#8B5CF6" },
  { value: "housing", label: "Housing", icon: "house", color: "#3B82F6" },
  { value: "education", label: "Education", icon: "graduation-cap", color: "#10B981" },
  { value: "travel", label: "Travel", icon: "plane", color: "#F59E0B" },
  { value: "vehicle", label: "Vehicle", icon: "car", color: "#7C3AED" },
  { value: "business", label: "Business", icon: "briefcase", color: "#6366F1" },
  { value: "other", label: "Other", icon: "star", color: "#6B7280" },
] as const;

export const GOAL_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
] as const;

export const ASSET_TYPES = [
  { value: "stock", label: "Stock" },
  { value: "bond", label: "Bond" },
  { value: "etf", label: "ETF" },
  { value: "mutual_fund", label: "Mutual fund" },
  { value: "crypto", label: "Crypto" },
  { value: "cash", label: "Cash" },
  { value: "alternative", label: "Alternative" },
  { value: "other", label: "Other" },
] as const;

export const LIABILITY_TYPES = [
  { value: "credit_card", label: "Credit card" },
  { value: "personal_loan", label: "Personal loan" },
  { value: "auto_loan", label: "Auto loan" },
  { value: "student_loan", label: "Student loan" },
  { value: "other", label: "Other" },
] as const;

export const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
] as const;

export const PROPERTY_INSURANCE_TYPES = [
  { value: "homeowners", label: "Homeowners" },
  { value: "landlord", label: "Landlord" },
  { value: "flood", label: "Flood" },
  { value: "earthquake", label: "Earthquake" },
  { value: "umbrella", label: "Umbrella" },
  { value: "other", label: "Other" },
] as const;

export const PROPERTY_COUNTRIES = [
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Ghana",
  "Nigeria",
  "South Africa",
  "UAE",
  "Singapore",
  "Germany",
  "France",
  "Netherlands",
  "Switzerland",
  "Japan",
  "Other",
] as const;

export const INSURANCE_CATEGORIES = [
  { value: "life", label: "Life" },
  { value: "health", label: "Health" },
  { value: "auto", label: "Auto" },
  { value: "home", label: "Home" },
  { value: "disability", label: "Disability" },
  { value: "umbrella", label: "Umbrella" },
  { value: "liability", label: "Liability" },
  { value: "travel", label: "Travel" },
  { value: "pet", label: "Pet" },
  { value: "other", label: "Other" },
] as const;

export function goalCategoryMeta(category: string) {
  return (
    GOAL_CATEGORIES.find((entry) => entry.value === category) ??
    GOAL_CATEGORIES.find((entry) => entry.value === "other")!
  );
}
