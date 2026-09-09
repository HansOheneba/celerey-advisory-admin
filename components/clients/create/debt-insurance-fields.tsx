"use client";

import { CreateFormSection } from "@/components/clients/create/create-form-section";
import { FormCheckbox } from "@/components/clients/create/form-checkbox";
import { FormSelect } from "@/components/clients/create/form-select";
import { LiabilityFormFields } from "@/components/clients/create/liability-form-fields";
import { RepeatableList } from "@/components/clients/create/repeatable-list";
import {
  indexedFieldName,
  useRepeatableKeys,
} from "@/components/clients/create/use-repeatable-keys";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectItem } from "@/components/ui/select";
import { INSURANCE_CATEGORIES } from "@/lib/clients/creation-options";

type DebtInsuranceFieldsProps = {
  currency: string;
};

export function DebtInsuranceFields({ currency }: DebtInsuranceFieldsProps) {
  const liabilities = useRepeatableKeys(0);
  const insurancePolicies = useRepeatableKeys(1);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <CreateFormSection
        id="liabilities"
        title="Standalone liabilities"
        description="Credit cards, auto loans, and other debt. Mortgages belong on the property record."
      >
        <RepeatableList
          items={liabilities.keys}
          onAdd={liabilities.add}
          onRemove={liabilities.remove}
          addLabel="Add liability"
          minItems={0}
          renderItem={(index) => (
            <LiabilityFormFields
              nameFor={(key) => indexedFieldName("liabilities", index, key)}
              idFor={(key) => `liability-${key}-${index}`}
              currency={currency}
              typeDefault="auto_loan"
            />
          )}
        />
      </CreateFormSection>

      <CreateFormSection
        id="insurance"
        title="Standalone insurance"
        description="Personal policies (life, health, auto, etc.). Property-tied cover belongs on the property form."
      >
        <RepeatableList
          items={insurancePolicies.keys}
          onAdd={insurancePolicies.add}
          onRemove={insurancePolicies.remove}
          addLabel="Add policy"
          minItems={0}
          renderItem={(index) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`insurance-name-${index}`}>Policy name</Label>
                <Input
                  id={`insurance-name-${index}`}
                  name={indexedFieldName("insurance", index, "name")}
                  placeholder="Term life"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`insurance-category-${index}`}>Category</Label>
                <FormSelect
                  id={`insurance-category-${index}`}
                  name={indexedFieldName("insurance", index, "category")}
                  defaultValue="life"
                >
                  {INSURANCE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </FormSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`insurance-provider-${index}`}>Provider</Label>
                <Input
                  id={`insurance-provider-${index}`}
                  name={indexedFieldName("insurance", index, "provider")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`insurance-policy-${index}`}>Policy number</Label>
                <Input
                  id={`insurance-policy-${index}`}
                  name={indexedFieldName("insurance", index, "policy_number")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`insurance-start-${index}`}>Start date</Label>
                <Input
                  id={`insurance-start-${index}`}
                  name={indexedFieldName("insurance", index, "start_date")}
                  type="date"
                  defaultValue={today}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`insurance-renewal-${index}`}>Renewal date</Label>
                <Input
                  id={`insurance-renewal-${index}`}
                  name={indexedFieldName("insurance", index, "renewal_date")}
                  type="date"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`insurance-premium-${index}`}>Premium (monthly)</Label>
                <Input
                  id={`insurance-premium-${index}`}
                  name={indexedFieldName("insurance", index, "premium_monthly")}
                  type="number"
                  min={0}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`insurance-coverage-${index}`}>Coverage amount</Label>
                <Input
                  id={`insurance-coverage-${index}`}
                  name={indexedFieldName("insurance", index, "coverage_amount")}
                  type="number"
                  min={0}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`insurance-deductible-${index}`}>Deductible</Label>
                <Input
                  id={`insurance-deductible-${index}`}
                  name={indexedFieldName("insurance", index, "deductible")}
                  type="number"
                  min={0}
                  step="0.01"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`insurance-beneficiary-${index}`}>Beneficiary</Label>
                <Input
                  id={`insurance-beneficiary-${index}`}
                  name={indexedFieldName("insurance", index, "beneficiary")}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`insurance-notes-${index}`}>Notes</Label>
                <Textarea
                  id={`insurance-notes-${index}`}
                  name={indexedFieldName("insurance", index, "notes")}
                  rows={2}
                />
              </div>
              <div className="sm:col-span-2">
                <FormCheckbox
                  id={`insurance-auto-${index}`}
                  name={indexedFieldName("insurance", index, "auto_renew")}
                  label="Auto renew"
                  defaultChecked
                />
              </div>
            </div>
          )}
        />
      </CreateFormSection>
    </div>
  );
}
