"use client";

import { useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { FormMoneyInput } from "@/components/clients/create/form-money-input";
import { FormSelect } from "@/components/clients/create/form-select";
import { FormSwitch } from "@/components/clients/create/form-switch";
import { PropertyInsuranceFields } from "@/components/clients/create/property-insurance-fields";
import { PropertyMortgageFields } from "@/components/clients/create/property-mortgage-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SelectItem } from "@/components/ui/select";
import {
  PROPERTY_COUNTRIES,
  PROPERTY_TYPES,
} from "@/lib/clients/creation-options";
import {
  computePropertyEquity,
  computePropertyLvr,
  propertyInsight,
} from "@/lib/clients/property-form";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type PropertyFormBodyProps = {
  nameFor: (key: string) => string;
  idFor: (key: string) => string;
  insuranceNameFor: (index: number, key: string) => string;
  currency: string;
  showInsight?: boolean;
};

const INSIGHT_CLASSES = {
  good: "border-sky-500/20 bg-sky-500/5 text-sky-800 dark:text-sky-300",
  warn: "border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300",
  info: "border-muted bg-muted/20 text-muted-foreground",
} as const;

export function PropertyFormBody({
  nameFor,
  idFor,
  insuranceNameFor,
  currency,
  showInsight = true,
}: PropertyFormBodyProps) {
  const [marketValue, setMarketValue] = useState(0);
  const [mortgageBalance, setMortgageBalance] = useState(0);
  const [propertyName, setPropertyName] = useState("");

  const equity = computePropertyEquity(marketValue, mortgageBalance);
  const lvr = computePropertyLvr(marketValue, mortgageBalance);

  const formatMoney = (value: number) =>
    formatCurrency(value, currency as "USD" | "GHS" | "GBP");

  const insight = useMemo(
    () =>
      propertyInsight({
        hasName: propertyName.trim().length > 0,
        marketValue,
        mortgageBalance,
        equity,
        lvr,
        formatMoney,
      }),
    [propertyName, marketValue, mortgageBalance, equity, lvr, currency],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor={idFor("name")}>Property name</Label>
        <Input
          id={idFor("name")}
          name={nameFor("name")}
          placeholder="e.g. Primary Residence, Rental Unit, Beach House"
          required
          onChange={(event) => setPropertyName(event.target.value)}
        />
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={idFor("property_type")}>Property type</Label>
          <FormSelect
            id={idFor("property_type")}
            name={nameFor("property_type")}
            defaultValue="house"
          >
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </FormSelect>
        </div>
        <FormSwitch
          id={idFor("is_primary")}
          name={nameFor("is_primary")}
          fieldLabel="Primary residence"
          description="Marks this as the client's main home for tax and planning."
        />
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={idFor("country")}>Country</Label>
          <FormSelect
            id={idFor("country")}
            name={nameFor("country")}
            placeholder="Select country"
          >
            {PROPERTY_COUNTRIES.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </FormSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor={idFor("city")}>City</Label>
          <Input
            id={idFor("city")}
            name={nameFor("city")}
            placeholder="e.g. New York, Sydney, Accra"
            required
          />
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={idFor("purchase_price")}>Purchase price</Label>
          <FormMoneyInput
            id={idFor("purchase_price")}
            name={nameFor("purchase_price")}
            currency={currency}
            placeholder="600,000"
          />
          <p className="text-xs text-muted-foreground">
            What the client originally paid for this property.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor={idFor("market_value")}>
            Current market value{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <FormMoneyInput
            id={idFor("market_value")}
            name={nameFor("market_value")}
            currency={currency}
            placeholder="850,000"
            onNumericChange={setMarketValue}
          />
        </div>
      </div>

      {marketValue > 0 ? (
        <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-between gap-4">
            <span>
              Equity:{" "}
              <span className="font-medium text-foreground">
                {formatMoney(equity)}
              </span>
            </span>
            <span>
              LVR:{" "}
              <span
                className={cn(
                  "font-medium",
                  lvr > 80
                    ? "text-rose-600 dark:text-rose-400"
                    : lvr > 60
                      ? "text-warning dark:text-amber-400"
                      : "text-foreground",
                )}
              >
                {lvr}%
              </span>
            </span>
          </div>
        </div>
      ) : null}

      <Separator />

      <PropertyMortgageFields
        nameFor={nameFor}
        idFor={idFor}
        currency={currency}
        onBalanceChange={setMortgageBalance}
      />

      <Separator />

      <PropertyInsuranceFields
        insuranceNameFor={insuranceNameFor}
        idFor={idFor}
        currency={currency}
      />

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={idFor("purchase_date")}>Purchase date</Label>
          <Input
            id={idFor("purchase_date")}
            name={nameFor("purchase_date")}
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            required
          />
          <p className="text-xs text-muted-foreground">
            When the client purchased or settled on this property.
          </p>
        </div>
      </div>

      {showInsight ? (
        <div
          className={cn(
            "rounded-xl border p-4 text-xs leading-relaxed",
            INSIGHT_CLASSES[insight.tone],
          )}
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{insight.message}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
