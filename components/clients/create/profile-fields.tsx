"use client";

import { useState } from "react";
import { FieldError } from "@/components/clients/create/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CURRENCY_OPTIONS,
  PREFERRED_CONTACT_OPTIONS,
  RISK_PROFILE_OPTIONS,
} from "@/lib/clients/creation-options";
import {
  CLIENT_COUNTRIES,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  NAME_PREFIXES,
} from "@/lib/clients/location-options";
import type { CreateClientFormState } from "@/lib/definitions";

type ProfileFieldsProps = {
  errors?: NonNullable<CreateClientFormState>["errors"];
  isSolo: boolean;
};

export function ProfileFields({ errors, isSolo }: ProfileFieldsProps) {
  const [prefix, setPrefix] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [preferredContact, setPreferredContact] = useState("email");
  const [riskProfile, setRiskProfile] = useState("");
  const [citizenship, setCitizenship] = useState("");
  const [investmentCurrency, setInvestmentCurrency] = useState("");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {isSolo ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="prefix">Prefix</Label>
            <input type="hidden" name="prefix" value={prefix} />
            <Select value={prefix} onValueChange={(value) => setPrefix(value ?? "")}>
              <SelectTrigger id="prefix" className="w-full">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {NAME_PREFIXES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <input type="hidden" name="gender" value={gender} />
            <Select value={gender} onValueChange={(value) => setGender(value ?? "")}>
              <SelectTrigger id="gender" className="w-full">
                <SelectValue placeholder="Prefer not to say" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="maritalStatus">Marital status</Label>
        <input type="hidden" name="maritalStatus" value={maritalStatus} />
        <Select
          value={maritalStatus}
          onValueChange={(value) => setMaritalStatus(value ?? "")}
        >
          <SelectTrigger id="maritalStatus" className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {MARITAL_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="occupation">Occupation</Label>
        <Input
          id="occupation"
          name="occupation"
          placeholder="Product manager"
          maxLength={50}
          aria-invalid={Boolean(errors?.occupation)}
        />
        <FieldError message={errors?.occupation?.[0]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dependents">Dependents</Label>
        <Input
          id="dependents"
          name="dependents"
          type="number"
          min={0}
          step={1}
          defaultValue={0}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="citizenships">Primary citizenship</Label>
        <input type="hidden" name="citizenships" value={citizenship} />
        <Select value={citizenship} onValueChange={(value) => setCitizenship(value ?? "")}>
          <SelectTrigger id="citizenships" className="w-full">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {CLIENT_COUNTRIES.map((country) => (
              <SelectItem key={country.value} value={country.label}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredContact">Preferred contact</Label>
        <input type="hidden" name="preferredContact" value={preferredContact} />
        <Select
          value={preferredContact}
          onValueChange={(value) => setPreferredContact(value ?? "email")}
        >
          <SelectTrigger id="preferredContact" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PREFERRED_CONTACT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="investmentCurrency">Investment currency</Label>
        <input type="hidden" name="investmentCurrency" value={investmentCurrency} />
        <Select
          value={investmentCurrency}
          onValueChange={(value) => setInvestmentCurrency(value ?? "")}
        >
          <SelectTrigger id="investmentCurrency" className="w-full">
            <SelectValue placeholder="Same as account currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCY_OPTIONS.map((currency) => (
              <SelectItem key={currency.value} value={currency.value}>
                {currency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Formats property and holding amounts on the client dashboard. Leave empty to use account currency.
        </p>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="riskProfile">Risk profile</Label>
        <input type="hidden" name="riskProfile" value={riskProfile} />
        <Select value={riskProfile} onValueChange={(value) => setRiskProfile(value ?? "")}>
          <SelectTrigger id="riskProfile" className="w-full sm:max-w-xs">
            <SelectValue placeholder="Select risk band" />
          </SelectTrigger>
          <SelectContent>
            {RISK_PROFILE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Used on Overview and profile until a full risk assessment is submitted.
        </p>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={3}
          placeholder="Optional short profile note"
        />
      </div>
    </div>
  );
}
