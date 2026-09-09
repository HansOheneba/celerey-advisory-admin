"use server";

import {
  deriveValuationMethod,
  isMarketAssetType,
  type AssetType,
} from "@/lib/clients/asset-holdings";
import {
  parsePropertyInsuranceFromForm,
  parsePropertyMortgageFromForm,
} from "@/lib/clients/property-form";
import {
  monthlyNeeded,
  nextProfileId,
  removeProfileItem,
  writeClientProfile,
  yearsRemainingFrom,
} from "@/lib/demo/profile";
import type {
  ProfileCollection,
  ProfileWriteResult,
} from "@/lib/demo/profile-types";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function number(formData: FormData, key: string): number {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : NaN;
}

function flag(formData: FormData, key: string): boolean {
  const value = String(formData.get(key) ?? "");
  return value === "true" || value === "on";
}

export async function addClientGoalAction(
  formData: FormData,
): Promise<ProfileWriteResult> {
  const clientId = text(formData, "clientId");
  const title = text(formData, "title");
  const category = text(formData, "category") || "other";
  const status = text(formData, "status") || "active";
  const target = number(formData, "target");
  const current = number(formData, "current") || 0;
  const targetDate = text(formData, "targetDate");
  const description = text(formData, "description");
  const priority = number(formData, "priority") || 1;

  if (!clientId || !title || !Number.isFinite(target) || target <= 0) {
    return { ok: false, message: "Add a title and a target amount." };
  }

  const yearsRemaining = targetDate ? yearsRemainingFrom(targetDate) : 5;
  const monthlyContribution = monthlyNeeded(target, current, yearsRemaining);

  return writeClientProfile(clientId, "profile.goal.added", title, (record) => {
    record.detail.goals.push({
      id: nextProfileId("goal"),
      userId: clientId,
      title,
      category,
      priority,
      description,
      yearsRemaining,
      current,
      target,
      monthlyContribution,
      status,
    });
  });
}

export async function addClientHoldingAction(
  formData: FormData,
): Promise<ProfileWriteResult> {
  const clientId = text(formData, "clientId");
  const name = text(formData, "name");
  const symbol = text(formData, "symbol");
  const assetType = (text(formData, "assetType") || "other") as AssetType;
  const currentValue = number(formData, "currentValue");
  const costBasis = number(formData, "costBasis");
  const quantity = number(formData, "quantity");
  const couponRate = number(formData, "couponRate");
  const parsedCoupon = Number.isFinite(couponRate) ? couponRate : null;
  const valuationMethod =
    text(formData, "valuationMethod") ||
    deriveValuationMethod(assetType, symbol, parsedCoupon);
  const maturityDate = text(formData, "maturityDate");
  const lastUpdated = text(formData, "lastUpdated");
  const initialValueDate = text(formData, "initialValueDate");

  if (!clientId || !name) {
    return { ok: false, message: "Add a holding name." };
  }

  if (isMarketAssetType(assetType)) {
    if (!symbol) {
      return { ok: false, message: "Market holdings need a symbol." };
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { ok: false, message: "Market holdings need a quantity greater than zero." };
    }
    if (!Number.isFinite(costBasis) || costBasis <= 0) {
      return { ok: false, message: "Market holdings need amount invested." };
    }
  }

  if (assetType === "cash") {
    if (!Number.isFinite(currentValue) || currentValue <= 0) {
      return { ok: false, message: "Cash holdings need a current value." };
    }
  }

  if (assetType === "bond") {
    if (!Number.isFinite(costBasis) || costBasis <= 0) {
      return { ok: false, message: "Bonds need face / par value." };
    }
    if (!Number.isFinite(parsedCoupon)) {
      return { ok: false, message: "Bonds need a coupon rate." };
    }
    if (!maturityDate) {
      return { ok: false, message: "Bonds need a maturity date." };
    }
  }

  const resolvedCurrent = Number.isFinite(currentValue)
    ? currentValue
    : Number.isFinite(costBasis)
      ? costBasis
      : NaN;

  if (!Number.isFinite(resolvedCurrent) || resolvedCurrent < 0) {
    return {
      ok: false,
      message: "Add a current value or amount invested for this holding.",
    };
  }

  return writeClientProfile(
    clientId,
    "profile.holding.added",
    name,
    (record) => {
      record.detail.holdings.push({
        holding_id: nextProfileId("holding"),
        name,
        symbol: symbol || undefined,
        asset_type: assetType,
        quantity: Number.isFinite(quantity) ? quantity : undefined,
        cost_basis: Number.isFinite(costBasis) ? costBasis : resolvedCurrent,
        current_value: resolvedCurrent,
        valuation_method: valuationMethod,
        coupon_rate: parsedCoupon ?? undefined,
        maturity_date: maturityDate || undefined,
        last_updated: lastUpdated || undefined,
        initial_value_date: initialValueDate || undefined,
      });
    },
  );
}

export async function addClientAccountAction(
  formData: FormData,
): Promise<ProfileWriteResult> {
  const clientId = text(formData, "clientId");
  const name = text(formData, "name");
  const institution = text(formData, "institution");
  const type = text(formData, "type") || "cash";
  const balance = number(formData, "balance");

  if (!clientId || !name || !Number.isFinite(balance) || balance < 0) {
    return { ok: false, message: "Add an account name and balance." };
  }

  return writeClientProfile(
    clientId,
    "profile.account.added",
    name,
    (record) => {
      record.detail.accounts.push({
        id: nextProfileId("account"),
        name,
        institution: institution || "Client bank",
        type,
        balance,
        currency: record.client.currency,
        updatedAt: new Date().toISOString(),
      });
    },
  );
}

export async function addClientIncomeAction(
  formData: FormData,
): Promise<ProfileWriteResult> {
  const clientId = text(formData, "clientId");
  const name = text(formData, "name");
  const amount = number(formData, "amount");
  const recurringType = text(formData, "recurringType") || "monthly";
  const startDate = text(formData, "startDate") || new Date().toISOString().slice(0, 10);

  if (!clientId || !name || !Number.isFinite(amount) || amount < 0) {
    return { ok: false, message: "Add an income name and amount." };
  }

  return writeClientProfile(
    clientId,
    "profile.income.added",
    name,
    (record) => {
      record.detail.incomeRows.push({
        id: nextProfileId("income"),
        name,
        amount,
        isRecurring: recurringType !== "one-time",
        recurringType,
        startDate,
        endDate: null,
      });
    },
  );
}

export async function addClientExpenseAction(
  formData: FormData,
): Promise<ProfileWriteResult> {
  const clientId = text(formData, "clientId");
  const name = text(formData, "name");
  const amount = number(formData, "amount");
  const recurringType = text(formData, "recurringType") || "monthly";
  const startDate = text(formData, "startDate") || new Date().toISOString().slice(0, 10);

  if (!clientId || !name || !Number.isFinite(amount) || amount < 0) {
    return { ok: false, message: "Add an expense name and amount." };
  }

  return writeClientProfile(
    clientId,
    "profile.expense.added",
    name,
    (record) => {
      record.detail.expenseCategories.push({
        id: nextProfileId("expense"),
        name,
        amount,
        essential: flag(formData, "essential"),
        isRecurring: recurringType !== "one-time",
        recurringType,
        startDate,
      });
    },
  );
}

export async function addClientLiabilityAction(
  formData: FormData,
): Promise<ProfileWriteResult> {
  const clientId = text(formData, "clientId");
  const name = text(formData, "name");
  const lender = text(formData, "lender");
  const type = text(formData, "type");
  const balance = number(formData, "balance");
  const interestRatePct = number(formData, "interestRatePct");
  const minPaymentMonthly = number(formData, "minPaymentMonthly");
  const dueDay = number(formData, "dueDay");
  const originalLoanAmount = number(formData, "originalLoanAmount");
  const expectedPayoffDate = text(formData, "expectedPayoffDate");

  if (!clientId || !name) {
    return { ok: false, message: "Add a liability name." };
  }

  if (!type) {
    return { ok: false, message: "Select a liability type." };
  }

  if (!Number.isFinite(balance) || balance <= 0) {
    return { ok: false, message: "Enter an outstanding balance greater than zero." };
  }

  return writeClientProfile(
    clientId,
    "profile.liability.added",
    name,
    (record) => {
      record.detail.liabilities.push({
        id: nextProfileId("liability"),
        name,
        lender: lender || "Undisclosed",
        type,
        balance,
        interestRatePct: Number.isFinite(interestRatePct)
          ? interestRatePct
          : undefined,
        minPaymentMonthly: Number.isFinite(minPaymentMonthly)
          ? minPaymentMonthly
          : undefined,
        dueDay:
          Number.isFinite(dueDay) && dueDay >= 1 && dueDay <= 31
            ? dueDay
            : undefined,
        originalLoanAmount: Number.isFinite(originalLoanAmount)
          ? originalLoanAmount
          : undefined,
        expectedPayoffDate: expectedPayoffDate || undefined,
      });
    },
  );
}

export async function addClientPropertyAction(
  formData: FormData,
): Promise<ProfileWriteResult> {
  const clientId = text(formData, "clientId");
  const name = text(formData, "name");
  const propertyType = text(formData, "property_type") || "house";
  const country = text(formData, "country");
  const city = text(formData, "city");
  const purchaseDate = text(formData, "purchase_date");
  const purchasePrice = number(formData, "purchase_price");
  const marketValue = number(formData, "market_value");
  const hasMarketValue = Number.isFinite(marketValue) && marketValue > 0;
  const valueUncertain = !hasMarketValue;
  const isPrimary = flag(formData, "is_primary");
  const mortgage = parsePropertyMortgageFromForm(formData);
  const insurance = parsePropertyInsuranceFromForm(formData, "insurance");

  if (!clientId || !name || !country || !city || !purchaseDate) {
    return {
      ok: false,
      message: "Add property name, location, and purchase date.",
    };
  }

  const resolvedValue = hasMarketValue ? marketValue : 0;
  const mortgageBalance = mortgage?.balance ?? 0;

  return writeClientProfile(
    clientId,
    "profile.property.added",
    name,
    (record) => {
      record.detail.propertyAssets.push({
        property_id: nextProfileId("property"),
        name,
        property_type: propertyType,
        country,
        city,
        purchase_date: purchaseDate,
        purchase_price: Number.isFinite(purchasePrice) ? purchasePrice : undefined,
        current_value: valueUncertain ? undefined : resolvedValue,
        market_value: valueUncertain ? undefined : resolvedValue,
        value_uncertain: valueUncertain,
        mortgage_balance: mortgageBalance,
        is_primary: isPrimary,
        mortgage: mortgage ?? undefined,
        insurance: insurance.length > 0 ? insurance : undefined,
      });
    },
  );
}

export async function addClientInsuranceAction(
  formData: FormData,
): Promise<ProfileWriteResult> {
  const clientId = text(formData, "clientId");
  const name = text(formData, "name");
  const provider = text(formData, "provider");
  const category = text(formData, "category") || "other";
  const coverageAmount = number(formData, "coverageAmount");
  const premiumMonthly = number(formData, "premiumMonthly");

  if (!clientId || !name) {
    return { ok: false, message: "Add a policy name." };
  }

  return writeClientProfile(
    clientId,
    "profile.insurance.added",
    name,
    (record) => {
      record.detail.insurancePolicies.push({
        policy_id: nextProfileId("policy"),
        category,
        provider: provider || "Undisclosed",
        name,
        coverage_amount: Number.isFinite(coverageAmount)
          ? coverageAmount
          : undefined,
        premium_monthly: Number.isFinite(premiumMonthly)
          ? premiumMonthly
          : undefined,
      });
    },
  );
}

export async function updateClientRetirementAction(
  formData: FormData,
): Promise<ProfileWriteResult> {
  const clientId = text(formData, "clientId");
  const currentAge = number(formData, "currentAge");
  const retirementAge = number(formData, "retirementAge");
  const currentInvested = number(formData, "currentInvested");
  const monthlySavings = number(formData, "monthlySavings");
  const existingPensionBalance = number(formData, "existingPensionBalance");
  const desiredMonthlyIncome = number(formData, "desiredMonthlyIncome");
  const expectedReturnPct = number(formData, "expectedReturnPct");
  const safeWithdrawalRatePct = number(formData, "safeWithdrawalRatePct");

  if (!clientId) {
    return { ok: false, message: "Missing client." };
  }

  return writeClientProfile(
    clientId,
    "profile.retirement.updated",
    "Retirement plan",
    (record) => {
      record.detail.retirement = {
        ...record.detail.retirement,
        currentAge: Number.isFinite(currentAge)
          ? currentAge
          : record.detail.retirement.currentAge,
        retirementAge: Number.isFinite(retirementAge)
          ? retirementAge
          : record.detail.retirement.retirementAge,
        currentInvested: Number.isFinite(currentInvested)
          ? currentInvested
          : record.detail.retirement.currentInvested,
        monthlySavings: Number.isFinite(monthlySavings)
          ? monthlySavings
          : record.detail.retirement.monthlySavings,
        existingPensionBalance: Number.isFinite(existingPensionBalance)
          ? existingPensionBalance
          : record.detail.retirement.existingPensionBalance,
        desiredMonthlyIncome: Number.isFinite(desiredMonthlyIncome)
          ? desiredMonthlyIncome
          : record.detail.retirement.desiredMonthlyIncome,
        expectedReturnPct: Number.isFinite(expectedReturnPct)
          ? expectedReturnPct
          : record.detail.retirement.expectedReturnPct,
        safeWithdrawalRatePct: Number.isFinite(safeWithdrawalRatePct)
          ? safeWithdrawalRatePct
          : record.detail.retirement.safeWithdrawalRatePct,
      };
    },
  );
}

export async function updateClientEmergencyFundAction(
  formData: FormData,
): Promise<ProfileWriteResult> {
  const clientId = text(formData, "clientId");
  const targetMonths = number(formData, "targetMonths");
  const currentCashBalance = number(formData, "currentCashBalance");
  const storageLocation = text(formData, "storageLocation");

  if (!clientId) {
    return { ok: false, message: "Missing client." };
  }

  return writeClientProfile(
    clientId,
    "profile.emergency.updated",
    "Emergency fund",
    (record) => {
      record.detail.emergencyFund = {
        ...record.detail.emergencyFund,
        targetMonths: Number.isFinite(targetMonths)
          ? targetMonths
          : record.detail.emergencyFund.targetMonths,
        currentCashBalance: Number.isFinite(currentCashBalance)
          ? currentCashBalance
          : record.detail.emergencyFund.currentCashBalance,
        storageLocation:
          storageLocation || record.detail.emergencyFund.storageLocation,
      };
    },
  );
}

export async function removeClientProfileItemAction(
  clientId: string,
  collection: ProfileCollection,
  itemId: string,
  label: string,
): Promise<ProfileWriteResult> {
  return writeClientProfile(
    clientId,
    `profile.${collection}.removed`,
    label,
    (record) => {
      removeProfileItem(record, collection, itemId);
    },
  );
}
