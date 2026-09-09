"use client";

import { FormMoneyInput } from "@/components/clients/create/form-money-input";
import { FormSelect } from "@/components/clients/create/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import { LIABILITY_TYPES } from "@/lib/clients/creation-options";

type LiabilityFormFieldsProps = {
  nameFor: (key: string) => string;
  idFor: (key: string) => string;
  currency: string;
  typeDefault?: string;
};

export function LiabilityFormFields({
  nameFor,
  idFor,
  currency,
  typeDefault = "",
}: LiabilityFormFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={idFor("name")}>Name</Label>
        <Input
          id={idFor("name")}
          name={nameFor("name")}
          placeholder="e.g. Car loan, credit card"
          required
        />
      </div>

      <p className="text-xs text-muted-foreground sm:col-span-2">
        Mortgages are managed directly on each property.
      </p>

      <div className="space-y-2">
        <Label htmlFor={idFor("type")}>Type</Label>
        <FormSelect
          id={idFor("type")}
          name={nameFor("type")}
          defaultValue={typeDefault}
          placeholder="Select type…"
        >
          {LIABILITY_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </FormSelect>
      </div>

      <div className="space-y-2">
        <Label htmlFor={idFor("balance")}>Outstanding balance</Label>
        <FormMoneyInput
          id={idFor("balance")}
          name={nameFor("balance")}
          currency={currency}
          placeholder="25,000"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={idFor("lender")}>Lender</Label>
        <Input
          id={idFor("lender")}
          name={nameFor("lender")}
          placeholder="e.g. Barclays, Standard Bank, Stanbic"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={idFor("interestRatePct")}>Interest rate (%)</Label>
        <Input
          id={idFor("interestRatePct")}
          name={nameFor("interestRatePct")}
          type="number"
          min={0}
          step="0.01"
          placeholder="16"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={idFor("minPaymentMonthly")}>Minimum monthly payment</Label>
        <FormMoneyInput
          id={idFor("minPaymentMonthly")}
          name={nameFor("minPaymentMonthly")}
          currency={currency}
          placeholder="650"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={idFor("dueDay")}>Payment due day</Label>
        <Input
          id={idFor("dueDay")}
          name={nameFor("dueDay")}
          type="number"
          min={1}
          max={31}
          placeholder="15"
        />
        <p className="text-xs text-muted-foreground">Day 1–31 of each month</p>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={idFor("originalLoanAmount")}>Original loan amount</Label>
        <FormMoneyInput
          id={idFor("originalLoanAmount")}
          name={nameFor("originalLoanAmount")}
          currency={currency}
          placeholder="40,000"
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={idFor("expectedPayoffDate")}>Expected payoff date</Label>
        <Input
          id={idFor("expectedPayoffDate")}
          name={nameFor("expectedPayoffDate")}
          type="date"
        />
      </div>
    </div>
  );
}
