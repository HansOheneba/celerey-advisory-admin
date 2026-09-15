"use client";

import {
  addClientAccountAction,
  addClientDependentAction,
  addClientExpenseAction,
  addClientGoalAction,
  addClientHoldingAction,
  addClientIncomeAction,
  addClientInsuranceAction,
  addClientLiabilityAction,
  addClientPropertyAction,
  submitClientRiskAssessmentAction,
  updateClientEmergencyFundAction,
  updateClientExpenseAction,
  updateClientGoalAction,
  updateClientHoldingAction,
  updateClientIncomeAction,
  updateClientInsuranceAction,
  updateClientLiabilityAction,
  updateClientPropertyAction,
  updateClientRetirementAction,
  updateClientTaxProfileAction,
  updateClientUserAction,
} from "@/app/actions/client-profile";
import { FormMoneyInput } from "@/components/clients/create/form-money-input";
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
  CURRENCY_OPTIONS,
  EMERGENCY_FUND_STORAGE_OPTIONS,
  EMERGENCY_FUND_TARGET_MONTHS,
  EXPENSE_CATEGORIES,
  GOAL_CATEGORIES,
  GOAL_STATUS_OPTIONS,
  INCOME_CATEGORIES,
  INSURANCE_CATEGORIES,
  PREFERRED_CONTACT_OPTIONS,
  RECURRING_TYPE_OPTIONS,
  RETIREMENT_STORAGE_OPTIONS,
  RISK_PROFILE_OPTIONS,
} from "@/lib/clients/creation-options";
import type { DisplayCurrency } from "@/lib/format";

type ClientIdProps = {
  clientId: string;
  currency?: DisplayCurrency;
};

export function AddGoalDialog({ clientId, currency = "USD" }: ClientIdProps) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Add goal"
      description="Add a goal for them if they cannot edit it on the portal."
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
          <FormMoneyInput
            id="goal-target"
            name="target"
            currency={currency}
            required
          />
        </ProfileField>
        <ProfileField label="Current amount" htmlFor="goal-current">
          <FormMoneyInput
            id="goal-current"
            name="current"
            currency={currency}
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
      description="Market holdings need symbol and quantity. Stocks need a current value."
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

export function AddAccountDialog({ clientId, currency = "USD" }: ClientIdProps) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Add cash account"
      description="Cash or bank account. Counts toward AUA and cash weight."
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
          <FormMoneyInput
            id="account-balance"
            name="balance"
            currency={currency}
            required
          />
        </ProfileField>
      </div>
    </ProfileEditorDialog>
  );
}

export function AddIncomeDialog({ clientId, currency = "USD" }: ClientIdProps) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Add income"
      description="Feeds surplus, emergency runway, and the cash-flow chart."
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
          <FormMoneyInput
            id="income-amount"
            name="amount"
            currency={currency}
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

export function AddExpenseDialog({ clientId, currency = "USD" }: ClientIdProps) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Add expense"
      description="Feeds surplus, savings rate, and emergency fund cover."
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
          <FormMoneyInput
            id="expense-amount"
            name="amount"
            currency={currency}
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
      description="Cards, auto loans, and other debt. Put mortgages on the property."
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
      description="Add a property. You can attach a mortgage and home insurance."
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
      description="Life, health, or other cover the client holds."
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
        <ProfileField label="Policy number" htmlFor="policy-number">
          <Input id="policy-number" name="policyNumber" />
        </ProfileField>
        <ProfileField label="Start date" htmlFor="policy-start">
          <Input id="policy-start" name="startDate" type="date" />
        </ProfileField>
        <ProfileField label="Renewal date" htmlFor="policy-renewal">
          <Input id="policy-renewal" name="renewalDate" type="date" />
        </ProfileField>
        <ProfileField label="Deductible" htmlFor="policy-deductible">
          <Input
            id="policy-deductible"
            name="deductible"
            type="number"
            min={0}
            step="0.01"
          />
        </ProfileField>
        <ProfileField label="Beneficiary" htmlFor="policy-beneficiary">
          <Input id="policy-beneficiary" name="beneficiary" />
        </ProfileField>
      </div>
      <ProfileField label="Notes" htmlFor="policy-notes">
        <Input id="policy-notes" name="notes" />
      </ProfileField>
      <FormCheckbox id="policy-auto-renew" name="autoRenew" label="Auto-renew" />
    </ProfileEditorDialog>
  );
}

export function EditUserProfileDialog({
  clientId,
  user,
}: ClientIdProps & {
  user: {
    phone_number: string | null;
    occupation: string | null;
    bio: string | null;
    preferred_contact?: string;
    investment_currency?: string;
    city: string | null;
  };
}) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Edit profile"
      description="Contact and household fields they see on the portal."
      triggerLabel="Edit profile"
      submitLabel="Save"
      successMessage="Profile updated"
      action={updateClientUserAction}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Phone" htmlFor="profile-phone">
          <Input
            id="profile-phone"
            name="phoneNumber"
            defaultValue={user.phone_number ?? ""}
          />
        </ProfileField>
        <ProfileField label="Preferred contact" htmlFor="profile-contact">
          <FormSelect
            id="profile-contact"
            name="preferredContact"
            defaultValue={user.preferred_contact ?? "email"}
          >
            {PREFERRED_CONTACT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </FormSelect>
        </ProfileField>
        <ProfileField label="City" htmlFor="profile-city">
          <Input id="profile-city" name="city" defaultValue={user.city ?? ""} />
        </ProfileField>
        <ProfileField label="Investment currency" htmlFor="profile-inv-currency">
          <FormSelect
            id="profile-inv-currency"
            name="investmentCurrency"
            defaultValue={user.investment_currency ?? "USD"}
          >
            {CURRENCY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </FormSelect>
        </ProfileField>
        <ProfileField label="Occupation" htmlFor="profile-occupation" className="sm:col-span-2">
          <Input
            id="profile-occupation"
            name="occupation"
            defaultValue={user.occupation ?? ""}
          />
        </ProfileField>
        <ProfileField label="Bio" htmlFor="profile-bio" className="sm:col-span-2">
          <Input id="profile-bio" name="bio" defaultValue={user.bio ?? ""} />
        </ProfileField>
      </div>
    </ProfileEditorDialog>
  );
}

export function AddDependentDialog({ clientId }: ClientIdProps) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Add dependent"
      description="Record a household member the client supports."
      triggerLabel="Add dependent"
      submitLabel="Add"
      successMessage="Dependent added"
      action={addClientDependentAction}
    >
      <ProfileField label="Name" htmlFor="dependent-name">
        <Input id="dependent-name" name="name" required />
      </ProfileField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Relationship" htmlFor="dependent-relationship">
          <Input id="dependent-relationship" name="relationship" required />
        </ProfileField>
        <ProfileField label="Date of birth" htmlFor="dependent-dob">
          <Input id="dependent-dob" name="dateOfBirth" type="date" required />
        </ProfileField>
        <ProfileField label="Financial reliance" htmlFor="dependent-reliance">
          <FormSelect
            id="dependent-reliance"
            name="financialReliance"
            defaultValue="partial"
          >
            <SelectItem value="full">Full</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </FormSelect>
        </ProfileField>
      </div>
    </ProfileEditorDialog>
  );
}

export function EditTaxProfileDialog({
  clientId,
  taxProfile,
}: ClientIdProps & {
  taxProfile: {
    effectiveTaxRatePct: number;
    marginalTaxRatePct: number;
    filingStatus: string;
    stateOrRegion: string;
  } | null;
}) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Edit tax profile"
      description="Tax assumptions used in planning and surplus calculations."
      triggerLabel="Edit tax"
      submitLabel="Save"
      successMessage="Tax profile updated"
      action={updateClientTaxProfileAction}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Effective rate %" htmlFor="tax-effective">
          <Input
            id="tax-effective"
            name="effectiveTaxRatePct"
            type="number"
            min={0}
            max={100}
            step="0.1"
            defaultValue={taxProfile?.effectiveTaxRatePct ?? 0}
          />
        </ProfileField>
        <ProfileField label="Marginal rate %" htmlFor="tax-marginal">
          <Input
            id="tax-marginal"
            name="marginalTaxRatePct"
            type="number"
            min={0}
            max={100}
            step="0.1"
            defaultValue={taxProfile?.marginalTaxRatePct ?? 0}
          />
        </ProfileField>
        <ProfileField label="Filing status" htmlFor="tax-filing">
          <Input
            id="tax-filing"
            name="filingStatus"
            defaultValue={taxProfile?.filingStatus ?? "Individual"}
          />
        </ProfileField>
        <ProfileField label="State / region" htmlFor="tax-region">
          <Input
            id="tax-region"
            name="stateOrRegion"
            defaultValue={taxProfile?.stateOrRegion ?? ""}
          />
        </ProfileField>
      </div>
    </ProfileEditorDialog>
  );
}

export function SubmitRiskAssessmentDialog({ clientId }: ClientIdProps) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Record risk assessment"
      description="File a risk band if they have not finished the questionnaire."
      triggerLabel="Record assessment"
      submitLabel="Submit"
      successMessage="Risk assessment recorded"
      action={submitClientRiskAssessmentAction}
    >
      <ProfileField label="Risk band" htmlFor="risk-band">
        <FormSelect id="risk-band" name="riskBand" defaultValue="moderate">
          {RISK_PROFILE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </FormSelect>
      </ProfileField>
    </ProfileEditorDialog>
  );
}

export function EditGoalDialog({
  clientId,
  goal,
  currency = "USD",
}: ClientIdProps & {
  goal: { id: string; title: string; current: number; target?: number };
}) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Edit goal"
      description="Update funded amount or target."
      triggerLabel="Edit"
      submitLabel="Save"
      successMessage="Goal updated"
      action={updateClientGoalAction}
    >
      <input type="hidden" name="goalId" value={goal.id} />
      <ProfileField label="Title" htmlFor={`goal-title-${goal.id}`}>
        <Input
          id={`goal-title-${goal.id}`}
          name="title"
          defaultValue={goal.title}
          required
        />
      </ProfileField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Current" htmlFor={`goal-current-${goal.id}`}>
          <FormMoneyInput
            id={`goal-current-${goal.id}`}
            name="current"
            currency={currency}
            defaultValue={goal.current}
          />
        </ProfileField>
        <ProfileField label="Target" htmlFor={`goal-target-${goal.id}`}>
          <FormMoneyInput
            id={`goal-target-${goal.id}`}
            name="target"
            currency={currency}
            defaultValue={goal.target ?? 0}
          />
        </ProfileField>
      </div>
    </ProfileEditorDialog>
  );
}

export function EditIncomeDialog({
  clientId,
  row,
  currency = "USD",
}: ClientIdProps & {
  row: { id: string; name: string; amount: number };
}) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Edit income"
      triggerLabel="Edit"
      submitLabel="Save"
      successMessage="Income updated"
      action={updateClientIncomeAction}
      description="Update a recurring income row."
    >
      <input type="hidden" name="incomeId" value={row.id} />
      <ProfileField label="Category" htmlFor={`income-name-${row.id}`}>
        <FormSelect
          id={`income-name-${row.id}`}
          name="name"
          defaultValue={row.name}
        >
          {INCOME_CATEGORIES.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </FormSelect>
      </ProfileField>
      <ProfileField label="Amount" htmlFor={`income-amount-${row.id}`}>
        <FormMoneyInput
          id={`income-amount-${row.id}`}
          name="amount"
          currency={currency}
          defaultValue={row.amount}
          required
        />
      </ProfileField>
    </ProfileEditorDialog>
  );
}

export function EditExpenseDialog({
  clientId,
  row,
  currency = "USD",
}: ClientIdProps & {
  row: { id: string; name: string; amount: number; essential: boolean };
}) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Edit expense"
      triggerLabel="Edit"
      submitLabel="Save"
      successMessage="Expense updated"
      action={updateClientExpenseAction}
      description="Update a recurring expense row."
    >
      <input type="hidden" name="expenseId" value={row.id} />
      <ProfileField label="Category" htmlFor={`expense-name-${row.id}`}>
        <FormSelect
          id={`expense-name-${row.id}`}
          name="name"
          defaultValue={row.name}
        >
          {EXPENSE_CATEGORIES.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </FormSelect>
      </ProfileField>
      <ProfileField label="Amount" htmlFor={`expense-amount-${row.id}`}>
        <FormMoneyInput
          id={`expense-amount-${row.id}`}
          name="amount"
          currency={currency}
          defaultValue={row.amount}
          required
        />
      </ProfileField>
      <FormCheckbox
        id={`expense-essential-${row.id}`}
        name="essential"
        label="Essential"
        defaultChecked={row.essential}
      />
    </ProfileEditorDialog>
  );
}

export function EditHoldingDialog({
  clientId,
  holding,
  currency = "USD",
}: ClientIdProps & {
  holding: {
    holding_id: string;
    name: string;
    current_value?: number;
    quantity?: number;
  };
}) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Edit holding"
      triggerLabel="Edit"
      submitLabel="Save"
      successMessage="Holding updated"
      action={updateClientHoldingAction}
      description="Update mark-to-market value or quantity."
    >
      <input type="hidden" name="holdingId" value={holding.holding_id} />
      <ProfileField label="Name" htmlFor={`holding-name-${holding.holding_id}`}>
        <Input
          id={`holding-name-${holding.holding_id}`}
          name="name"
          defaultValue={holding.name}
          required
        />
      </ProfileField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Current value" htmlFor={`holding-value-${holding.holding_id}`}>
          <FormMoneyInput
            id={`holding-value-${holding.holding_id}`}
            name="currentValue"
            currency={currency}
            defaultValue={holding.current_value ?? 0}
          />
        </ProfileField>
        <ProfileField label="Quantity" htmlFor={`holding-qty-${holding.holding_id}`}>
          <Input
            id={`holding-qty-${holding.holding_id}`}
            name="quantity"
            type="number"
            min={0}
            step="0.0001"
            defaultValue={holding.quantity ?? 0}
          />
        </ProfileField>
      </div>
    </ProfileEditorDialog>
  );
}

export function EditLiabilityDialog({
  clientId,
  liability,
  currency = "USD",
}: ClientIdProps & {
  liability: {
    id: string;
    name: string;
    balance: number;
    minPaymentMonthly?: number;
  };
}) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Edit liability"
      triggerLabel="Edit"
      submitLabel="Save"
      successMessage="Liability updated"
      action={updateClientLiabilityAction}
      description="Update balance or minimum payment."
    >
      <input type="hidden" name="liabilityId" value={liability.id} />
      <ProfileField label="Name" htmlFor={`liability-name-${liability.id}`}>
        <Input
          id={`liability-name-${liability.id}`}
          name="name"
          defaultValue={liability.name}
          required
        />
      </ProfileField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Balance" htmlFor={`liability-balance-${liability.id}`}>
          <FormMoneyInput
            id={`liability-balance-${liability.id}`}
            name="balance"
            currency={currency}
            defaultValue={liability.balance}
          />
        </ProfileField>
        <ProfileField label="Min payment" htmlFor={`liability-min-${liability.id}`}>
          <FormMoneyInput
            id={`liability-min-${liability.id}`}
            name="minPaymentMonthly"
            currency={currency}
            defaultValue={liability.minPaymentMonthly ?? 0}
          />
        </ProfileField>
      </div>
    </ProfileEditorDialog>
  );
}

export function EditInsurancePolicyDialog({
  clientId,
  policy,
  currency = "USD",
}: ClientIdProps & {
  policy: {
    policy_id: string;
    name: string;
    provider: string;
    coverage_amount?: number;
    premium_monthly?: number;
    renewal_date?: string;
  };
}) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Edit policy"
      triggerLabel="Edit"
      submitLabel="Save"
      successMessage="Policy updated"
      action={updateClientInsuranceAction}
      description="Update cover amount, premium, or renewal date."
    >
      <input type="hidden" name="policyId" value={policy.policy_id} />
      <ProfileField label="Policy name" htmlFor={`policy-name-${policy.policy_id}`}>
        <Input
          id={`policy-name-${policy.policy_id}`}
          name="name"
          defaultValue={policy.name}
          required
        />
      </ProfileField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Provider" htmlFor={`policy-provider-${policy.policy_id}`}>
          <Input
            id={`policy-provider-${policy.policy_id}`}
            name="provider"
            defaultValue={policy.provider}
          />
        </ProfileField>
        <ProfileField label="Renewal" htmlFor={`policy-renewal-${policy.policy_id}`}>
          <Input
            id={`policy-renewal-${policy.policy_id}`}
            name="renewalDate"
            type="date"
            defaultValue={String(policy.renewal_date ?? "").slice(0, 10)}
          />
        </ProfileField>
        <ProfileField label="Cover" htmlFor={`policy-cover-${policy.policy_id}`}>
          <FormMoneyInput
            id={`policy-cover-${policy.policy_id}`}
            name="coverageAmount"
            currency={currency}
            defaultValue={policy.coverage_amount ?? 0}
          />
        </ProfileField>
        <ProfileField label="Premium" htmlFor={`policy-premium-${policy.policy_id}`}>
          <FormMoneyInput
            id={`policy-premium-${policy.policy_id}`}
            name="premiumMonthly"
            currency={currency}
            defaultValue={policy.premium_monthly ?? 0}
          />
        </ProfileField>
      </div>
    </ProfileEditorDialog>
  );
}

export function EditPropertyDialog({
  clientId,
  property,
  currency = "USD",
}: ClientIdProps & {
  property: {
    property_id: string;
    name: string;
    market_value?: number;
    current_value?: number;
  };
}) {
  const value = property.market_value ?? property.current_value ?? 0;

  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Edit property"
      triggerLabel="Edit"
      submitLabel="Save"
      successMessage="Property updated"
      action={updateClientPropertyAction}
      description="Update name or estimated market value."
    >
      <input type="hidden" name="propertyId" value={property.property_id} />
      <ProfileField label="Name" htmlFor={`property-name-${property.property_id}`}>
        <Input
          id={`property-name-${property.property_id}`}
          name="name"
          defaultValue={property.name}
          required
        />
      </ProfileField>
      <ProfileField label="Market value" htmlFor={`property-value-${property.property_id}`}>
        <FormMoneyInput
          id={`property-value-${property.property_id}`}
          name="marketValue"
          currency={currency}
          defaultValue={value}
        />
      </ProfileField>
    </ProfileEditorDialog>
  );
}

export function EditRetirementDialog({
  clientId,
  retirement,
  currency = "USD",
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
    storageLocation?: string;
  };
}) {
  return (
    <ProfileEditorDialog
      clientId={clientId}
      title="Edit retirement"
      description="Update retirement assumptions and where savings are held."
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
          <FormMoneyInput
            id="ret-invested"
            name="currentInvested"
            currency={currency}
            defaultValue={retirement.currentInvested}
          />
        </ProfileField>
        <ProfileField label="Monthly savings" htmlFor="ret-savings">
          <FormMoneyInput
            id="ret-savings"
            name="monthlySavings"
            currency={currency}
            defaultValue={retirement.monthlySavings}
          />
        </ProfileField>
        <ProfileField label="Pension balance" htmlFor="ret-pension">
          <FormMoneyInput
            id="ret-pension"
            name="existingPensionBalance"
            currency={currency}
            defaultValue={retirement.existingPensionBalance}
          />
        </ProfileField>
        <ProfileField label="Desired monthly income" htmlFor="ret-income">
          <FormMoneyInput
            id="ret-income"
            name="desiredMonthlyIncome"
            currency={currency}
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
        <ProfileField
          label="Storage location"
          htmlFor="ret-storage"
          className="sm:col-span-2"
        >
          <FormSelect
            id="ret-storage"
            name="storageLocation"
            defaultValue={retirement.storageLocation ?? "employer_pension"}
          >
            {RETIREMENT_STORAGE_OPTIONS.map((option) => (
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

export function EditEmergencyFundDialog({
  clientId,
  emergencyFund,
  currency = "USD",
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
          <FormMoneyInput
            id="ef-cash"
            name="currentCashBalance"
            currency={currency}
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
