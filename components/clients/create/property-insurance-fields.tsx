"use client";

import { FormMoneyInput } from "@/components/clients/create/form-money-input";
import { FormSelect } from "@/components/clients/create/form-select";
import { RepeatableList } from "@/components/clients/create/repeatable-list";
import { useRepeatableKeys } from "@/components/clients/create/use-repeatable-keys";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import { PROPERTY_INSURANCE_TYPES } from "@/lib/clients/creation-options";

type PropertyInsuranceFieldsProps = {
  insuranceNameFor: (index: number, key: string) => string;
  idFor: (key: string) => string;
  currency: string;
};

export function PropertyInsuranceFields({
  insuranceNameFor,
  idFor,
  currency,
}: PropertyInsuranceFieldsProps) {
  const insurance = useRepeatableKeys(0);

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium">Property insurance</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Property-tied cover (homeowners, landlord, etc.). Not the same as
          standalone life or health policies.
        </p>
        {insurance.keys.length === 0 ? (
          <p className="mt-2 text-xs font-medium text-warning dark:text-amber-400">
            No coverage
          </p>
        ) : null}
      </div>

      <RepeatableList
        items={insurance.keys}
        onAdd={insurance.add}
        onRemove={insurance.remove}
        addLabel="Add policy"
        itemLabel="Policy"
        minItems={0}
        renderItem={(insuranceIndex) => (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={idFor(`insurance-${insuranceIndex}-type`)}>Type</Label>
              <FormSelect
                id={idFor(`insurance-${insuranceIndex}-type`)}
                name={insuranceNameFor(insuranceIndex, "insurance_type")}
                defaultValue="homeowners"
              >
                {PROPERTY_INSURANCE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </FormSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor={idFor(`insurance-${insuranceIndex}-provider`)}>
                Provider
              </Label>
              <Input
                id={idFor(`insurance-${insuranceIndex}-provider`)}
                name={insuranceNameFor(insuranceIndex, "provider")}
                placeholder="e.g. State Farm, Allianz"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={idFor(`insurance-${insuranceIndex}-policy`)}>
                Policy number
              </Label>
              <Input
                id={idFor(`insurance-${insuranceIndex}-policy`)}
                name={insuranceNameFor(insuranceIndex, "policy_number")}
                placeholder="e.g. HO-2024-88412"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={idFor(`insurance-${insuranceIndex}-coverage`)}>
                Coverage amount
              </Label>
              <FormMoneyInput
                id={idFor(`insurance-${insuranceIndex}-coverage`)}
                name={insuranceNameFor(insuranceIndex, "coverage_amount")}
                currency={currency}
                placeholder="850,000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={idFor(`insurance-${insuranceIndex}-premium`)}>
                Annual premium
              </Label>
              <FormMoneyInput
                id={idFor(`insurance-${insuranceIndex}-premium`)}
                name={insuranceNameFor(insuranceIndex, "annual_premium")}
                currency={currency}
                placeholder="2,400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={idFor(`insurance-${insuranceIndex}-deductible`)}>
                Deductible
              </Label>
              <FormMoneyInput
                id={idFor(`insurance-${insuranceIndex}-deductible`)}
                name={insuranceNameFor(insuranceIndex, "deductible")}
                currency={currency}
                placeholder="2,500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={idFor(`insurance-${insuranceIndex}-expiry`)}>
                Expiry date
              </Label>
              <Input
                id={idFor(`insurance-${insuranceIndex}-expiry`)}
                name={insuranceNameFor(insuranceIndex, "expiry_date")}
                type="date"
                required
              />
            </div>
          </div>
        )}
      />
    </div>
  );
}
