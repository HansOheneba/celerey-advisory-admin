import type { ClientSegment } from "@/lib/demo/types";
import type {
  ClientSpec,
  InsuranceSpec,
  LiabilitySpec,
  PropertySpec,
} from "@/lib/demo/seed/client-builder";
import { expensesFor } from "@/lib/demo/seed/portfolio-helpers";

function hashSeed(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length] as T;
}

function scaled(value: number, portfolio: number, base = 3_000_000): number {
  return Math.round(value * (portfolio / base));
}

function defaultProperty(
  spec: ClientSpec,
  seed: number,
  withMortgage: boolean,
): PropertySpec {
  const value = scaled(420_000, spec.holdings.reduce((t, h) => t + h.value, 0) + spec.accounts.reduce((t, a) => t + a.balance, 0));
  const purchase = Math.round(value * 0.82);

  return {
    name: pick(
      ["Family home", "Primary residence", "Investment flat"],
      seed,
    ),
    type: "house",
    country: spec.country,
    city: spec.city,
    purchase,
    current: value,
    purchaseDate: "2020-06-01",
    isPrimary: true,
    mortgage: withMortgage
      ? {
          lender: pick(["GCB", "Stanbic", "Ecobank"], seed),
          balance: Math.round(value * 0.35),
          interestRatePct: 12 + (seed % 8),
          minPaymentMonthly: Math.round(value * 0.004),
          termYears: 20,
          startDate: "2020-06-01",
        }
      : undefined,
    insurance: [
      {
        type: "homeowners",
        provider: "Enterprise Insurance",
        policyNumber: `EI-H-${seed % 10000}`,
        coverageAmount: value,
        annualPremium: Math.round(value * 0.004),
        expiryDate: "2027-06-01",
      },
    ],
  };
}

function defaultInsurance(spec: ClientSpec, seed: number): InsuranceSpec {
  const portfolio =
    spec.holdings.reduce((t, h) => t + h.value, 0) +
    spec.accounts.reduce((t, a) => t + a.balance, 0);

  return {
    category: seed % 2 === 0 ? "life" : "health",
    provider: pick(["Enterprise Life", "Bupa", "NHIS + private top-up"], seed),
    name: seed % 2 === 0 ? "Term life" : "Health cover",
    coverage: scaled(200_000, portfolio),
    premium: scaled(120, portfolio, 5_000_000),
    policyNumber: `POL-${spec.id.toUpperCase()}-01`,
    startDate: "2024-01-01",
    renewalDate: daysFromSeed(seed, 90),
    deductible: seed % 2 === 0 ? 0 : 2000,
    autoRenew: true,
    beneficiary: spec.maritalStatus === "married" ? "Spouse" : undefined,
  };
}

function daysFromSeed(seed: number, daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead + (seed % 30));
  return date.toISOString().slice(0, 10);
}

function defaultLiability(spec: ClientSpec, seed: number): LiabilitySpec {
  const portfolio =
    spec.holdings.reduce((t, h) => t + h.value, 0) +
    spec.accounts.reduce((t, a) => t + a.balance, 0);

  return {
    name: pick(["Car loan", "Personal loan", "Credit facility"], seed),
    lender: pick(["Stanbic", "Fidelity Bank", "Absa"], seed),
    type: seed % 3 === 0 ? "auto_loan" : "personal_loan",
    balance: scaled(25_000, portfolio),
    ratePct: 14 + (seed % 10),
    monthly: scaled(650, portfolio),
    dueDay: 15 + (seed % 14),
  };
}

const HNW_SEGMENTS: ClientSegment[] = ["prestige", "ultra", "mass_affluent"];

/**
 * Ensures filler and thin specs have data in every client-dashboard tab.
 * Skipped when `skipEnrich` is set (reference personas).
 */
export function enrichClientSpec(spec: ClientSpec): ClientSpec {
  if (spec.skipEnrich) {
    return spec;
  }

  const seed = hashSeed(spec.id);
  const portfolio =
    spec.holdings.reduce((total, row) => total + row.value, 0) +
    spec.accounts.reduce((total, row) => total + row.balance, 0);

  const properties = [...(spec.properties ?? [])];
  const insurance = [...(spec.insurance ?? [])];
  const liabilities = [...(spec.liabilities ?? [])];
  const goals = [...spec.goals];
  const baseIncome = Math.max(
    spec.income.reduce((total, row) => total + row.amount, 0),
    portfolio * 0.012,
    5000,
  );
  const income =
    spec.income.length >= 2
      ? spec.income
      : [
          { name: "Salary", amount: Math.round(baseIncome * 0.85), category: "Salary" },
          {
            name: "Other income",
            amount: Math.round(baseIncome * 0.15),
            category: "Other",
          },
        ];
  const expenses =
    spec.expenses.length >= 3
      ? spec.expenses
      : expensesFor(Math.max(portfolio * 0.005, 2500));

  const isWealthy =
    HNW_SEGMENTS.includes(spec.segment) || portfolio > 3_000_000;

  if (properties.length === 0 && isWealthy) {
    properties.push(defaultProperty(spec, seed, seed % 3 !== 0));
  }

  if (insurance.length === 0) {
    insurance.push(defaultInsurance(spec, seed));
  }

  const standaloneLiabilities = liabilities.filter((l) => l.type !== "mortgage");
  if (standaloneLiabilities.length === 0 && seed % 4 !== 0) {
    liabilities.push(defaultLiability(spec, seed));
  }

  if (goals.length < 2 && goals.length > 0) {
    const primary = goals[0];
    if (primary) {
      goals.push({
        title: "Emergency fund top-up",
        category: "emergency",
        target: Math.round(primary.target * 0.4),
        current: Math.round(primary.current * 0.5),
        monthly: Math.round(primary.monthly * 0.35),
        years: 1.5,
        priority: 2,
        status: "active",
      });
    }
  }

  return {
    ...spec,
    preferredContact:
      spec.preferredContact ?? pick(["email", "whatsapp", "phone"], seed),
    investmentCurrency:
      spec.investmentCurrency ??
      (spec.currency === "GHS" ? "USD" : spec.currency),
    prefix:
      spec.prefix ??
      (spec.gender === "female" ? "Ms" : spec.gender === "male" ? "Mr" : null),
    properties,
    insurance,
    liabilities,
    goals,
    income,
    expenses,
    dependents:
      spec.dependents ??
      (spec.maritalStatus === "married"
        ? [
            {
              name: `${spec.lastName} partner`,
              relationship: "spouse",
              ageYears: spec.age - 2,
              reliance: "partial",
            },
          ]
        : []),
  };
}
