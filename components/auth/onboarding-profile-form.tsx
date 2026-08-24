"use client";

import { useActionState, useState } from "react";
import { completeAdvisorOnboardingAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADVISOR_COUNTRIES, ADVISOR_TIMEZONES } from "@/lib/settings/options";

const darkInput =
  "h-11 border-white/20 bg-white/5 text-white placeholder:text-white/40";
const darkPrimaryButton =
  "h-11 w-full bg-white text-primary hover:bg-white/90";
const darkSelectTrigger =
  "h-11 w-full border-white/20 bg-white/5 text-white";

type OnboardingProfileFormProps = {
  token: string;
  defaultName: string;
};

export function OnboardingProfileForm({
  token,
  defaultName,
}: OnboardingProfileFormProps) {
  const [state, action, pending] = useActionState(
    completeAdvisorOnboardingAction,
    undefined,
  );
  const [country, setCountry] = useState("GH");
  const [timezone, setTimezone] = useState("Africa/Accra");

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="country" value={country} />
      <input type="hidden" name="timezone" value={timezone} />

      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-white/80">
          Full name
        </Label>
        <Input
          id="displayName"
          name="displayName"
          autoComplete="name"
          defaultValue={defaultName}
          required
          className={darkInput}
          aria-invalid={Boolean(state?.errors?.displayName)}
        />
        {state?.errors?.displayName ? (
          <p className="text-xs text-red-300">{state.errors.displayName[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-white/80">
          Job title
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Senior Wealth Advisor"
          required
          className={darkInput}
          aria-invalid={Boolean(state?.errors?.title)}
        />
        {state?.errors?.title ? (
          <p className="text-xs text-red-300">{state.errors.title[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-white/80">
          Phone
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+233 20 000 0000"
          required
          className={darkInput}
          aria-invalid={Boolean(state?.errors?.phone)}
        />
        {state?.errors?.phone ? (
          <p className="text-xs text-red-300">{state.errors.phone[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-white/80">Country</Label>
          <Select value={country} onValueChange={(value) => setCountry(value ?? "GH")}>
            <SelectTrigger className={darkSelectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADVISOR_COUNTRIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-white/80">Timezone</Label>
          <Select
            value={timezone}
            onValueChange={(value) => setTimezone(value ?? "Africa/Accra")}
          >
            <SelectTrigger className={darkSelectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADVISOR_TIMEZONES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-white/80">
          Bio <span className="font-normal text-white/40">(optional)</span>
        </Label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          placeholder="A short introduction clients will see."
          className="w-full resize-none rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus-visible:border-white/40"
        />
        {state?.errors?.bio ? (
          <p className="text-xs text-red-300">{state.errors.bio[0]}</p>
        ) : null}
      </div>

      {state?.message ? (
        <p
          className="rounded-md border border-red-300/30 bg-red-400/10 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" className={darkPrimaryButton} disabled={pending}>
        {pending ? "Saving..." : "Finish setup"}
      </Button>
    </form>
  );
}
