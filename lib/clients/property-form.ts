export type PropertyMortgageInput = {
  lender: string;
  balance: number;
  interest_rate_pct?: number;
  min_payment_monthly?: number;
  due_day?: number;
  original_loan_amount?: number;
  expected_payoff_date?: string;
};

export type PropertyInsuranceInput = {
  insurance_type: string;
  provider: string;
  policy_number?: string;
  coverage_amount: number;
  annual_premium: number;
  deductible?: number;
  expiry_date: string;
};

export function formatNumberWithCommas(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export function parseMoneyInput(value: string): number {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function computePropertyEquity(
  marketValue: number,
  mortgageBalance: number,
): number {
  return Math.max(0, marketValue - mortgageBalance);
}

export function computePropertyLvr(
  marketValue: number,
  mortgageBalance: number,
): number {
  if (marketValue <= 0) {
    return 0;
  }
  return Math.round((mortgageBalance / marketValue) * 100);
}

type PropertyInsightTone = "info" | "good" | "warn";

export function propertyInsight(input: {
  hasName: boolean;
  marketValue: number;
  mortgageBalance: number;
  equity: number;
  lvr: number;
  formatMoney: (value: number) => string;
}): { tone: PropertyInsightTone; message: string } {
  const { hasName, marketValue, mortgageBalance, equity, lvr, formatMoney } =
    input;

  if (!hasName || marketValue <= 0) {
    return {
      tone: "info",
      message:
        "Fill in the details to see how this property fits the portfolio.",
    };
  }

  if (lvr > 80) {
    return {
      tone: "warn",
      message: `LVR is ${lvr}%. High leverage may limit refinancing options.`,
    };
  }

  if (lvr > 60) {
    return {
      tone: "info",
      message: `LVR is ${lvr}%. Equity is ${formatMoney(equity)}.`,
    };
  }

  if (mortgageBalance === 0 && marketValue > 0) {
    return {
      tone: "good",
      message: `Paid off. ${formatMoney(marketValue)} in equity.`,
    };
  }

  return {
    tone: "good",
    message: `LVR ${lvr}%. Equity ${formatMoney(equity)}.`,
  };
}

function readText(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function readNumber(formData: FormData, key: string): number {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : NaN;
}

export function parsePropertyMortgageFromForm(
  formData: FormData,
  prefix = "mortgage",
): PropertyMortgageInput | null {
  const lender = readText(formData, `${prefix}.lender`);
  const balance = readNumber(formData, `${prefix}.balance`);

  if (!lender || !Number.isFinite(balance) || balance <= 0) {
    return null;
  }

  const interestRate = readNumber(formData, `${prefix}.interest_rate_pct`);
  const minPayment = readNumber(formData, `${prefix}.min_payment_monthly`);
  const dueDay = readNumber(formData, `${prefix}.due_day`);
  const originalLoan = readNumber(formData, `${prefix}.original_loan_amount`);
  const payoffDate = readText(formData, `${prefix}.expected_payoff_date`);

  return {
    lender,
    balance,
    interest_rate_pct: Number.isFinite(interestRate) ? interestRate : undefined,
    min_payment_monthly: Number.isFinite(minPayment) ? minPayment : undefined,
    due_day:
      Number.isFinite(dueDay) && dueDay >= 1 && dueDay <= 31
        ? dueDay
        : undefined,
    original_loan_amount: Number.isFinite(originalLoan)
      ? originalLoan
      : undefined,
    expected_payoff_date: payoffDate || undefined,
  };
}

export function parsePropertyInsuranceFromForm(
  formData: FormData,
  prefix: string,
): PropertyInsuranceInput[] {
  const policies: PropertyInsuranceInput[] = [];

  for (let index = 0; index < 20; index += 1) {
    const base = `${prefix}[${index}]`;
    const provider = readText(formData, `${base}.provider`);

    if (!provider) {
      if (!formData.has(`${base}.insurance_type`)) {
        break;
      }
      continue;
    }

    const coverage = readNumber(formData, `${base}.coverage_amount`);
    const premium = readNumber(formData, `${base}.annual_premium`);
    const expiryDate = readText(formData, `${base}.expiry_date`);
    const deductible = readNumber(formData, `${base}.deductible`);

    if (
      !Number.isFinite(coverage) ||
      coverage <= 0 ||
      !Number.isFinite(premium) ||
      premium <= 0 ||
      !expiryDate
    ) {
      continue;
    }

    policies.push({
      insurance_type:
        readText(formData, `${base}.insurance_type`) || "homeowners",
      provider,
      policy_number: readText(formData, `${base}.policy_number`) || undefined,
      coverage_amount: coverage,
      annual_premium: premium,
      deductible: Number.isFinite(deductible) ? deductible : undefined,
      expiry_date: expiryDate,
    });
  }

  return policies;
}
