"use client";

import {
  addClientAccountAction,
  addClientExpenseAction,
  addClientGoalAction,
  addClientHoldingAction,
  addClientIncomeAction,
  addClientInsuranceAction,
  addClientLiabilityAction,
  addClientPropertyAction,
  updateClientEmergencyFundAction,
  updateClientRetirementAction,
} from "@/app/actions/client-profile";
import { AssetHoldingFields } from "@/components/clients/create/asset-holding-fields";
import { FormCheckbox } from "@/components/clients/create/form-checkbox";
import { LiabilityFormFields } from "@/components/clients/create/liability-form-fields";
import { PropertyFormBody } from "@/components/clients/create/property-form-body";
import { FormSelect } from "@/components/clients/create/form-select";
import { profileHoldingFieldName } from "@/lib/clients/asset-holdings";
import { ProfileEditorDialog } from "@/components/clients/profile/profile-editor-dialog";
import { ProfileField } from "@/components/clients/profile/profile-field";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import {
  EMERGENCY_FUND_STORAGE_OPTIONS,
  EMERGENCY_FUND_TARGET_MONTHS,
  EXPENSE_CATEGORIES,
  GOAL_CATEGORIES,
  GOAL_STATUS_OPTIONS,
  INCOME_CATEGORIES,
  INSURANCE_CATEGORIES,
  RECURRING_TYPE_OPTIONS,
} from "@/lib/clients/creation-options";

type ClientIdProps = {
  clientId: string;
};

export function AddGoalDialog({ clientId }: ClientIdProps) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Add goal"
      description="Capture a goal on the client's behalf — useful when they are read-only on the portal."
      triggerLabel="Add goal"
      submitLabel="Add goal"
      successMessage="Goal added"
      action={addClientGoalAction}
    >
      <ProfileField label="Title" htmlFor="goal-title">
        <Input id="goal-title" name="title" placeholder="House deposit" required />
      </ProfileField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Category" htmlFor="goal-category">
          <FormSelect id="goal-category" name="category" defaultValue="housing">
            {GOAL_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </FormSelect>
        </ProfileField>
        <ProfileField label="Status" htmlFor="goal-status">
          <FormSelect id="goal-status" name="status" defaultValue="active">
            {GOAL_STATUS_OPTIONS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </FormSelect>
        </ProfileField>
        <ProfileField label="Target amount" htmlFor="goal-target">
          <Input
            id="goal-target"
            name="target"
            type="number"
            min={1}
            step="0.01"
            required
          />
        </ProfileField>
        <ProfileField label="Current amount" htmlFor="goal-current">
          <Input
            id="goal-current"
            name="current"
            type="number"
            min={0}
            step="0.01"
            defaultValue={0}
          />
        </ProfileField>
        <ProfileField label="Target date" htmlFor="goal-date">
          <Input id="goal-date" name="targetDate" type="date" required />
        </ProfileField>
        <ProfileField label="Priority" htmlFor="goal-priority">
          <Input
            id="goal-priority"
            name="priority"
            type="number"
            min={1}
            defaultValue={1}
          />
        </ProfileField>
      </div>
      <ProfileField label="Description" htmlFor="goal-description">
        <Input
          id="goal-description"
          name="description"
          placeholder="Optional context"
        />
      </ProfileField>
    </ProfileEditorDialog>
  );
}

export function AddHoldingDialog({ clientId }: ClientIdProps) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Add holding"
      description="Fields follow the client dashboard contract — market types need symbol and quantity; stocks need a current value mark."
      triggerLabel="Add holding"
      submitLabel="Add holding"
      successMessage="Holding added"
      action={addClientHoldingAction}
    >
      <AssetHoldingFields
        nameFor={profileHoldingFieldName}
        idFor={(key) => `holding-${key}`}
        defaultAssetType="stock"
        initialValueDate={today}
      />
    </ProfileEditorDialog>
  );
}

export function AddAccountDialog({ clientId }: ClientIdProps) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Add cash account"
      description="Add a cash or bank account that counts toward AUA and cash weighting."
      triggerLabel="Add account"
      submitLabel="Add account"
      successMessage="Account added"
      action={addClientAccountAction}
    >
      <ProfileField label="Name" htmlFor="account-name">
        <Input id="account-name" name="name" placeholder="USD current account" required />
      </ProfileField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Institution" htmlFor="account-institution">
          <Input id="account-institution" name="institution" placeholder="Bank name" />
        </ProfileField>
        <ProfileField label="Type" htmlFor="account-type">
          <Input id="account-type" name="type" defaultValue="cash" />
        </ProfileField>
        <ProfileField label="Balance" htmlFor="account-balance" className="space-y-2 sm:col-span-2">
          <Input
            id="account-balance"
            name="balance"
            type="number"
            min={0}
            step="0.01"
            required
          />
        </ProfileField>
      </div>
    </ProfileEditorDialog>
  );
}

export function AddIncomeDialog({ clientId }: ClientIdProps) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Add income"
      description="Income rows feed surplus, emergency runway and the cash-flow chart."
      triggerLabel="Add income"
      submitLabel="Add income"
      successMessage="Income added"
      action={addClientIncomeAction}
    >
      <ProfileField label="Name" htmlFor="income-name">
        <FormSelect id="income-name" name="name" defaultValue="salary">
          {INCOME_CATEGORIES.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </FormSelect>
      </ProfileField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Amount" htmlFor="income-amount">
          <Input
            id="income-amount"
            name="amount"
            type="number"
            min={0}
            step="0.01"
            required
          />
        </ProfileField>
        <ProfileField label="Frequency" htmlFor="income-recurring">
          <FormSelect
            id="income-recurring"
            name="recurringType"
            defaultValue="monthly"
          >
            {RECURRING_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </FormSelect>
        </ProfileField>
        <ProfileField label="Start date" htmlFor="income-start" className="space-y-2 sm:col-span-2">
          <Input id="income-start" name="startDate" type="date" />
        </ProfileField>
      </div>
    </ProfileEditorDialog>
  );
}

export function AddExpenseDialog({ clientId }: ClientIdProps) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Add expense"
      description="Expenses drive surplus, savings rate and emergency-fund cover."
      triggerLabel="Add expense"
      submitLabel="Add expense"
      successMessage="Expense added"
      action={addClientExpenseAction}
    >
      <ProfileField label="Name" htmlFor="expense-name">
        <FormSelect id="expense-name" name="name" defaultValue="housing">
          {EXPENSE_CATEGORIES.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </FormSelect>
      </ProfileField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Amount" htmlFor="expense-amount">
          <Input
            id="expense-amount"
            name="amount"
            type="number"
            min={0}
            step="0.01"
            required
          />
        </ProfileField>
        <ProfileField label="Frequency" htmlFor="expense-recurring">
          <FormSelect
            id="expense-recurring"
            name="recurringType"
            defaultValue="monthly"
          >
            {RECURRING_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </FormSelect>
        </ProfileField>
      </div>
      <FormCheckbox id="expense-essential" name="essential" label="Essential" />
    </ProfileEditorDialog>
  );
}

type AddLiabilityDialogProps = ClientIdProps & {
  currency: string;
};

export function AddLiabilityDialog({ clientId, currency }: AddLiabilityDialogProps) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Add liability"
      description="Credit cards, auto loans, and other standalone debt. Mortgages belong on the property record."
      triggerLabel="Add liability"
      submitLabel="Add liability"
      successMessage="Liability added"
      action={addClientLiabilityAction}
      contentClassName="sm:max-w-2xl"
    >
      <LiabilityFormFields
        nameFor={(key) => key}
        idFor={(key) => `liability-${key}`}
        currency={currency}
      />
    </ProfileEditorDialog>
  );
}

type AddPropertyDialogProps = ClientIdProps & {
  currency: string;
};

export function AddPropertyDialog({ clientId, currency }: AddPropertyDialogProps) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Add property"
      description="Track a new real estate holding with optional mortgage and property-tied insurance."
      triggerLabel="Add property"
      submitLabel="Add property"
      successMessage="Property added"
      action={addClientPropertyAction}
      contentClassName="flex max-h-[min(90vh,860px)] flex-col gap-0 overflow-hidden sm:max-w-2xl"
    >
      <div className="max-h-[min(70vh,680px)] overflow-y-auto pr-1">
        <PropertyFormBody
          nameFor={(key) => key}
          idFor={(key) => `property-${key}`}
          insuranceNameFor={(index, key) => `insurance[${index}].${key}`}
          currency={currency}
        />
      </div>
    </ProfileEditorDialog>
  );
}

export function AddInsuranceDialog({ clientId }: ClientIdProps) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Add protection"
      description="Record life, health or other cover held by the client."
      triggerLabel="Add cover"
      submitLabel="Add cover"
      successMessage="Policy added"
      action={addClientInsuranceAction}
    >
      <ProfileField label="Policy name" htmlFor="policy-name">
        <Input id="policy-name" name="name" placeholder="Term life" required />
      </ProfileField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Provider" htmlFor="policy-provider">
          <Input id="policy-provider" name="provider" />
        </ProfileField>
        <ProfileField label="Category" htmlFor="policy-category">
          <FormSelect id="policy-category" name="category" defaultValue="life">
            {INSURANCE_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </FormSelect>
        </ProfileField>
        <ProfileField label="Cover amount" htmlFor="policy-cover">
          <Input
            id="policy-cover"
            name="coverageAmount"
            type="number"
            min={0}
            step="0.01"
          />
        </ProfileField>
        <ProfileField label="Monthly premium" htmlFor="policy-premium">
          <Input
            id="policy-premium"
            name="premiumMonthly"
            type="number"
            min={0}
            step="0.01"
          />
        </ProfileField>
      </div>
    </ProfileEditorDialog>
  );
}

export function EditRetirementDialog({
  clientId,
  retirement,
}: ClientIdProps & {
  retirement: {
    currentAge: number;
    retirementAge: number;
    currentInvested: number;
    monthlySavings: number;
    existingPensionBalance: number;
    desiredMonthlyIncome: number;
    expectedReturnPct: number;
    safeWithdrawalRatePct: number;
  };
}) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Edit retirement"
      description="Update the retirement assumptions used on the plan."
      triggerLabel="Edit"
      submitLabel="Save"
      successMessage="Retirement plan updated"
      action={updateClientRetirementAction}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Current age" htmlFor="ret-age">
          <Input
            id="ret-age"
            name="currentAge"
            type="number"
            min={18}
            defaultValue={retirement.currentAge}
          />
        </ProfileField>
        <ProfileField label="Retirement age" htmlFor="ret-target">
          <Input
            id="ret-target"
            name="retirementAge"
            type="number"
            min={40}
            defaultValue={retirement.retirementAge}
          />
        </ProfileField>
        <ProfileField label="Invested today" htmlFor="ret-invested">
          <Input
            id="ret-invested"
            name="currentInvested"
            type="number"
            min={0}
            step="0.01"
            defaultValue={retirement.currentInvested}
          />
        </ProfileField>
        <ProfileField label="Monthly savings" htmlFor="ret-savings">
          <Input
            id="ret-savings"
            name="monthlySavings"
            type="number"
            min={0}
            step="0.01"
            defaultValue={retirement.monthlySavings}
          />
        </ProfileField>
        <ProfileField label="Pension balance" htmlFor="ret-pension">
          <Input
            id="ret-pension"
            name="existingPensionBalance"
            type="number"
            min={0}
            step="0.01"
            defaultValue={retirement.existingPensionBalance}
          />
        </ProfileField>
        <ProfileField label="Desired monthly income" htmlFor="ret-income">
          <Input
            id="ret-income"
            name="desiredMonthlyIncome"
            type="number"
            min={0}
            step="0.01"
            defaultValue={retirement.desiredMonthlyIncome}
          />
        </ProfileField>
        <ProfileField label="Expected return %" htmlFor="ret-return">
          <Input
            id="ret-return"
            name="expectedReturnPct"
            type="number"
            min={0}
            step="0.1"
            defaultValue={retirement.expectedReturnPct}
          />
        </ProfileField>
        <ProfileField label="Safe withdrawal %" htmlFor="ret-swr">
          <Input
            id="ret-swr"
            name="safeWithdrawalRatePct"
            type="number"
            min={0}
            step="0.1"
            defaultValue={retirement.safeWithdrawalRatePct}
          />
        </ProfileField>
      </div>
    </ProfileEditorDialog>
  );
}

export function EditEmergencyFundDialog({
  clientId,
  emergencyFund,
}: ClientIdProps & {
  emergencyFund: {
    targetMonths: number;
    currentCashBalance: number;
    storageLocation?: string;
  };
}) {
  const allowedMonths = EMERGENCY_FUND_TARGET_MONTHS as readonly number[];
  const targetMonths = String(
    allowedMonths.includes(emergencyFund.targetMonths)
      ? emergencyFund.targetMonths
      : 6,
  );

  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Edit emergency fund"
      description="Update cash held for emergencies and the cover target."
      triggerLabel="Edit"
      submitLabel="Save"
      successMessage="Emergency fund updated"
      action={updateClientEmergencyFundAction}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Cash held" htmlFor="ef-cash">
          <Input
            id="ef-cash"
            name="currentCashBalance"
            type="number"
            min={0}
            step="0.01"
            defaultValue={emergencyFund.currentCashBalance}
          />
        </ProfileField>
        <ProfileField label="Target months" htmlFor="ef-months">
          <FormSelect
            id="ef-months"
            name="targetMonths"
            defaultValue={targetMonths}
          >
            {EMERGENCY_FUND_TARGET_MONTHS.map((months) => (
              <SelectItem key={months} value={String(months)}>
                {months} months
              </SelectItem>
            ))}
          </FormSelect>
        </ProfileField>
        <ProfileField
          label="Held at"
          htmlFor="ef-storage"
          className="space-y-2 sm:col-span-2"
        >
          <FormSelect
            id="ef-storage"
            name="storageLocation"
            defaultValue={emergencyFund.storageLocation ?? "savings_account"}
          >
            {EMERGENCY_FUND_STORAGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </FormSelect>
        </ProfileField>
      </div>
    </ProfileEditorDialog>
  );
}
