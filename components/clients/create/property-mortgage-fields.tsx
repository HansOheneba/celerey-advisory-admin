"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMoneyInput } from "@/components/clients/create/form-money-input";

type PropertyMortgageFieldsProps = {
  nameFor: (key: string) => string;
  idFor: (key: string) => string;
  currency: string;
  onBalanceChange?: (balance: number) => void;
};

export function PropertyMortgageFields({
  nameFor,
  idFor,
  currency,
  onBalanceChange,
}: PropertyMortgageFieldsProps) {
  const [open, setOpen] = useState(false);

  function closeMortgage() {
    setOpen(false);
    onBalanceChange?.(0);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-medium">
            Mortgage{" "}
            <span className="font-normal text-muted-foreground">· Optional</span>
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Adding mortgage details here makes it visible as a read-only entry in
            the Liabilities tab.
          </p>
        </div>
        {open ? (
          <Button type="button" variant="ghost" size="sm" onClick={closeMortgage}>
            Cancel
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
            Add mortgage details
          </Button>
        )}
      </div>

      {open ? (
        <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
          <div className="space-y-2">
            <Label htmlFor={idFor("mortgage.lender")}>Lender</Label>
            <Input
              id={idFor("mortgage.lender")}
              name={nameFor("mortgage.lender")}
              placeholder="e.g. Barclays, Standard Bank, Chase"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={idFor("mortgage.balance")}>Outstanding balance</Label>
              <FormMoneyInput
                id={idFor("mortgage.balance")}
                name={nameFor("mortgage.balance")}
                currency={currency}
                placeholder="450,000"
                onNumericChange={onBalanceChange}
              />
              <p className="text-xs text-muted-foreground">
                This also updates the mortgage balance on the property.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor={idFor("mortgage.interest_rate_pct")}>
                Interest rate (%)
              </Label>
              <Input
                id={idFor("mortgage.interest_rate_pct")}
                name={nameFor("mortgage.interest_rate_pct")}
                type="number"
                min={0}
                step="0.01"
                placeholder="4.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={idFor("mortgage.min_payment_monthly")}>
                Minimum monthly payment
              </Label>
              <FormMoneyInput
                id={idFor("mortgage.min_payment_monthly")}
                name={nameFor("mortgage.min_payment_monthly")}
                currency={currency}
                placeholder="2,500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={idFor("mortgage.due_day")}>Payment due day</Label>
              <Input
                id={idFor("mortgage.due_day")}
                name={nameFor("mortgage.due_day")}
                type="number"
                min={1}
                max={31}
                placeholder="1"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={idFor("mortgage.original_loan_amount")}>
                Original loan amount
              </Label>
              <FormMoneyInput
                id={idFor("mortgage.original_loan_amount")}
                name={nameFor("mortgage.original_loan_amount")}
                currency={currency}
                placeholder="500,000"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={idFor("mortgage.expected_payoff_date")}>
                Expected payoff date
              </Label>
              <Input
                id={idFor("mortgage.expected_payoff_date")}
                name={nameFor("mortgage.expected_payoff_date")}
                type="date"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
