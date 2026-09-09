"use client";

import { useMemo, useState } from "react";
import { FieldError } from "@/components/clients/create/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACCOUNT_MODES,
  CLIENT_COUNTRIES,
  COUNTRY_STATES,
  currencyForCountry,
  type AccountMode,
} from "@/lib/clients/location-options";
import type { CreateClientFormState } from "@/lib/definitions";

type IdentityFieldsProps = {
  errors?: NonNullable<CreateClientFormState>["errors"];
  accountMode: AccountMode;
  onAccountModeChange: (mode: AccountMode) => void;
  onCountryChange?: (countryCode: string) => void;
};

export function IdentityFields({
  errors,
  accountMode,
  onAccountModeChange,
  onCountryChange,
}: IdentityFieldsProps) {
  const [residentCountry, setResidentCountry] = useState("GH");
  const [residentState, setResidentState] = useState("");
  const [currency, setCurrency] = useState(() => currencyForCountry("GH"));

  const states = useMemo(
    () => COUNTRY_STATES[residentCountry] ?? [],
    [residentCountry],
  );

  const handleCountryChange = (nextCountry: string | null) => {
    const country = nextCountry ?? "GH";
    setResidentCountry(country);
    setResidentState("");
    setCurrency(currencyForCountry(country));
    onCountryChange?.(country);
  };

  const isSolo = accountMode === "solo";

  return (
    <div className="space-y-4">
      <input type="hidden" name="accountMode" value={accountMode} />
      <input type="hidden" name="currency" value={currency} />

      <div className="space-y-2">
        <Label>Account type</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {ACCOUNT_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => onAccountModeChange(mode.value)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                accountMode === mode.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <span className="font-medium">{mode.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {mode.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ama.darko@example.com"
          required
          aria-invalid={Boolean(errors?.email)}
        />
        <FieldError message={errors?.email?.[0]} />
      </div>

      {isSolo ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              placeholder="Ama"
              required
              maxLength={25}
              aria-invalid={Boolean(errors?.firstName)}
            />
            <FieldError message={errors?.firstName?.[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              placeholder="Darko"
              required
              maxLength={25}
              aria-invalid={Boolean(errors?.lastName)}
            />
            <FieldError message={errors?.lastName?.[0]} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              aria-invalid={Boolean(errors?.dateOfBirth)}
            />
            <FieldError message={errors?.dateOfBirth?.[0]} />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="displayName">Household name</Label>
          <Input
            id="displayName"
            name="displayName"
            placeholder="The Mensah Household"
            required
            maxLength={100}
            aria-invalid={Boolean(errors?.displayName)}
          />
          <FieldError message={errors?.displayName?.[0]} />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          autoComplete="tel"
          placeholder="+233201234567"
          required
          aria-invalid={Boolean(errors?.phoneNumber)}
        />
        <FieldError message={errors?.phoneNumber?.[0]} />
        <p className="text-xs text-muted-foreground">
          Store the full international number in E.164 format.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Country of residence</Label>
          <Select value={residentCountry} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLIENT_COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="residentCountry" value={residentCountry} />
          <FieldError message={errors?.residentCountry?.[0]} />
        </div>

        {states.length > 0 ? (
          <div className="space-y-2">
            <Label htmlFor="residentState">State / region</Label>
            <input type="hidden" name="residentState" value={residentState} />
            <Select
              value={residentState}
              onValueChange={(value) => setResidentState(value ?? "")}
            >
              <SelectTrigger id="residentState" className="w-full">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors?.residentState?.[0]} />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="residentCity">City</Label>
          <Input
            id="residentCity"
            name="residentCity"
            autoComplete="address-level2"
            placeholder="Accra"
            required
            aria-invalid={Boolean(errors?.residentCity)}
          />
          <FieldError message={errors?.residentCity?.[0]} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currencyDisplay">Currency</Label>
          <Input id="currencyDisplay" value={currency} readOnly disabled />
          <FieldError message={errors?.currency?.[0]} />
        </div>
      </div>
    </div>
  );
}
