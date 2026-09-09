"use client";

import { CreateFormSection } from "@/components/clients/create/create-form-section";
import { FormCheckbox } from "@/components/clients/create/form-checkbox";
import { FormSelect } from "@/components/clients/create/form-select";
import { GoalItemFields } from "@/components/clients/create/goal-item-fields";
import { RepeatableList } from "@/components/clients/create/repeatable-list";
import {
  indexedFieldName,
  useRepeatableKeys,
} from "@/components/clients/create/use-repeatable-keys";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import type { AccountMode } from "@/lib/clients/location-options";
import {
  CURRENCY_OPTIONS,
  EMERGENCY_FUND_STORAGE_OPTIONS,
  EMERGENCY_FUND_TARGET_MONTHS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  RECURRING_TYPE_OPTIONS,
  RETIREMENT_STORAGE_OPTIONS,
} from "@/lib/clients/creation-options";

type PlanFieldsProps = {
  accountMode: AccountMode;
  defaultCurrency?: string;
};

export function PlanFields({ accountMode, defaultCurrency = "GHS" }: PlanFieldsProps) {
  const goals = useRepeatableKeys(1);
  const incomes = useRepeatableKeys(1);
  const expenses = useRepeatableKeys(2);
  const today = new Date().toISOString().slice(0, 10);
  const isSolo = accountMode === "solo";

  return (
    <div className="space-y-5">
      <CreateFormSection
        id="goals"
        title="Goals"
        description="At least one goal with category, progress, and target date."
      >
        <RepeatableList
          items={goals.keys}
          onAdd={goals.add}
          onRemove={goals.remove}
          addLabel="Add goal"
          minItems={1}
          renderItem={(index) => (
            <GoalItemFields
              index={index}
              nameFor={(key) => indexedFieldName("goals", index, key)}
              idFor={(key) => `goal-${key}-${index}`}
            />
          )}
        />
      </CreateFormSection>

      <CreateFormSection
        id="cash-flow"
        title="Cash flow"
        description="Income and expenses drive surplus, emergency runway, and cash-flow charts."
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Income</h3>
            <RepeatableList
              items={incomes.keys}
              onAdd={incomes.add}
              onRemove={incomes.remove}
              addLabel="Add income"
              minItems={1}
              renderItem={(index) => (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`income-name-${index}`}>Name</Label>
                    <Input
                      id={`income-name-${index}`}
                      name={indexedFieldName("incomes", index, "name")}
                      placeholder="Salary"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`income-amount-${index}`}>Amount</Label>
                    <Input
                      id={`income-amount-${index}`}
                      name={indexedFieldName("incomes", index, "amount")}
                      type="number"
                      min={0}
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`income-category-${index}`}>Category</Label>
                    <FormSelect
                      id={`income-category-${index}`}
                      name={indexedFieldName("incomes", index, "category")}
                      defaultValue="salary"
                    >
                      {INCOME_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </FormSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`income-currency-${index}`}>Source currency</Label>
                    <FormSelect
                      id={`income-currency-${index}`}
                      name={indexedFieldName("incomes", index, "source_currency")}
                      defaultValue={defaultCurrency}
                    >
                      {CURRENCY_OPTIONS.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </FormSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`income-recurring-${index}`}>Recurring</Label>
                    <FormSelect
                      id={`income-recurring-${index}`}
                      name={indexedFieldName("incomes", index, "recurring_type")}
                      defaultValue="monthly"
                    >
                      {RECURRING_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </FormSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`income-start-${index}`}>Start date</Label>
                    <Input
                      id={`income-start-${index}`}
                      name={indexedFieldName("incomes", index, "start_date")}
                      type="date"
                      defaultValue={today}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`income-end-${index}`}>End date</Label>
                    <Input
                      id={`income-end-${index}`}
                      name={indexedFieldName("incomes", index, "end_date")}
                      type="date"
                    />
                  </div>
                </div>
              )}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Expenses</h3>
            <RepeatableList
              items={expenses.keys}
              onAdd={expenses.add}
              onRemove={expenses.remove}
              addLabel="Add expense"
              minItems={1}
              renderItem={(index) => (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`expense-name-${index}`}>Name</Label>
                    <Input
                      id={`expense-name-${index}`}
                      name={indexedFieldName("expenses", index, "name")}
                      placeholder="Rent"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`expense-amount-${index}`}>Amount</Label>
                    <Input
                      id={`expense-amount-${index}`}
                      name={indexedFieldName("expenses", index, "amount")}
                      type="number"
                      min={0}
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`expense-category-${index}`}>Category</Label>
                    <FormSelect
                      id={`expense-category-${index}`}
                      name={indexedFieldName("expenses", index, "category")}
                      defaultValue="housing"
                    >
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </FormSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`expense-currency-${index}`}>Source currency</Label>
                    <FormSelect
                      id={`expense-currency-${index}`}
                      name={indexedFieldName("expenses", index, "source_currency")}
                      defaultValue={defaultCurrency}
                    >
                      {CURRENCY_OPTIONS.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </FormSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`expense-recurring-${index}`}>Recurring</Label>
                    <FormSelect
                      id={`expense-recurring-${index}`}
                      name={indexedFieldName("expenses", index, "recurring_type")}
                      defaultValue="monthly"
                    >
                      {RECURRING_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </FormSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`expense-start-${index}`}>Start date</Label>
                    <Input
                      id={`expense-start-${index}`}
                      name={indexedFieldName("expenses", index, "start_date")}
                      type="date"
                      defaultValue={today}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`expense-end-${index}`}>End date</Label>
                    <Input
                      id={`expense-end-${index}`}
                      name={indexedFieldName("expenses", index, "end_date")}
                      type="date"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FormCheckbox
                      id={`expense-essential-${index}`}
                      name={indexedFieldName("expenses", index, "essential")}
                      label="Essential expense"
                      defaultChecked
                    />
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </CreateFormSection>

      <CreateFormSection
        id="emergency-fund"
        title="Emergency fund"
        description="Cash balance and target months feed Overview runway and cash-flow health."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergencyCashBalance">Cash balance</Label>
            <Input
              id="emergencyCashBalance"
              name="emergencyFund.cash_balance"
              type="number"
              min={0}
              step="0.01"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyTargetMonths">Target months</Label>
            <FormSelect
              id="emergencyTargetMonths"
              name="emergencyFund.target_months"
              defaultValue="6"
            >
              {EMERGENCY_FUND_TARGET_MONTHS.map((months) => (
                <SelectItem key={months} value={String(months)}>
                  {months} months
                </SelectItem>
              ))}
            </FormSelect>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="emergencyStorage">Storage location</Label>
            <FormSelect
              id="emergencyStorage"
              name="emergencyFund.storage_location"
              defaultValue="savings_account"
              triggerClassName="w-full sm:max-w-md"
            >
              {EMERGENCY_FUND_STORAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </FormSelect>
          </div>
        </div>
      </CreateFormSection>

      <CreateFormSection
        id="retirement"
        title="Retirement"
        description={
          isSolo
            ? "Retirement age applies to solo accounts. Current age is always derived from date of birth."
            : "Partner and family accounts use a target retirement year instead of age."
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {isSolo ? (
            <div className="space-y-2">
              <Label htmlFor="retirementAge">Retirement age</Label>
              <Input
                id="retirementAge"
                name="retirement.retirementAge"
                type="number"
                min={50}
                max={100}
                defaultValue={60}
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="retirementTargetYear">Retirement target year</Label>
              <Input
                id="retirementTargetYear"
                name="retirement.retirement_target_year"
                type="number"
                min={new Date().getFullYear()}
                max={2100}
                defaultValue={new Date().getFullYear() + 25}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="desiredMonthlyIncome">Desired monthly income</Label>
            <Input
              id="desiredMonthlyIncome"
              name="retirement.desiredMonthlyIncome"
              type="number"
              min={0}
              step="0.01"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlySavings">Monthly savings</Label>
            <Input
              id="monthlySavings"
              name="retirement.monthlySavings"
              type="number"
              min={0}
              step="0.01"
              defaultValue={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentInvested">Current invested</Label>
            <Input
              id="currentInvested"
              name="retirement.currentInvested"
              type="number"
              min={0}
              step="0.01"
              defaultValue={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="existingPensionBalance">Existing pension balance</Label>
            <Input
              id="existingPensionBalance"
              name="retirement.existingPensionBalance"
              type="number"
              min={0}
              step="0.01"
              defaultValue={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyPensionContribution">Monthly pension contribution</Label>
            <Input
              id="monthlyPensionContribution"
              name="retirement.monthlyPensionContribution"
              type="number"
              min={0}
              step="0.01"
              defaultValue={0}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="retirementStorage">Storage location</Label>
            <FormSelect
              id="retirementStorage"
              name="retirement.storageLocation"
              defaultValue="employer_pension"
              triggerClassName="w-full sm:max-w-md"
            >
              {RETIREMENT_STORAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </FormSelect>
          </div>
        </div>

        <details className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-4">
          <summary className="cursor-pointer text-sm font-medium">
            Assumptions (optional)
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lifeExpectancy">Life expectancy</Label>
              <Input
                id="lifeExpectancy"
                name="retirement.lifeExpectancy"
                type="number"
                min={60}
                max={120}
                defaultValue={85}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedReturnPct">Expected return (%)</Label>
              <Input
                id="expectedReturnPct"
                name="retirement.expectedReturnPct"
                type="number"
                min={0}
                step="0.1"
                defaultValue={7}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inflationPct">Inflation (%)</Label>
              <Input
                id="inflationPct"
                name="retirement.inflationPct"
                type="number"
                min={0}
                step="0.1"
                defaultValue={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="safeWithdrawalRatePct">Safe withdrawal rate (%)</Label>
              <Input
                id="safeWithdrawalRatePct"
                name="retirement.safeWithdrawalRatePct"
                type="number"
                min={0}
                step="0.1"
                defaultValue={4}
              />
            </div>
          </div>
        </details>
      </CreateFormSection>
    </div>
  );
}
