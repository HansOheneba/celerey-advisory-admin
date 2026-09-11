"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClientAction } from "@/app/actions/clients";
import { CreateClientAdminFields } from "@/components/clients/create-client-admin-fields";
import { CreateFormSection } from "@/components/clients/create/create-form-section";
import { CreateWizardNav } from "@/components/clients/create/create-wizard-nav";
import { DebtInsuranceFields } from "@/components/clients/create/debt-insurance-fields";
import { HoldingsFields } from "@/components/clients/create/holdings-fields";
import { IdentityFields } from "@/components/clients/create/identity-fields";
import { PlanFields } from "@/components/clients/create/plan-fields";
import { ProfileFields } from "@/components/clients/create/profile-fields";
import { Button } from "@/components/ui/button";
import { CREATE_CLIENT_WIZARD_STEPS } from "@/lib/clients/create-steps";
import type { AccountMode } from "@/lib/clients/location-options";
import { currencyForCountry } from "@/lib/clients/location-options";
import { cn } from "@/lib/utils";
import type { Advisor } from "@/types/advisor";

type DirectClientFormProps = {
  canManageSubscriptions: boolean;
  advisors: Advisor[];
};

export function DirectClientForm({
  canManageSubscriptions,
  advisors,
}: DirectClientFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createClientAction, undefined);
  const [accountMode, setAccountMode] = useState<AccountMode>("solo");
  const [currentStep, setCurrentStep] = useState(0);
  const [residentCountry, setResidentCountry] = useState("GH");

  const stepCount = CREATE_CLIENT_WIZARD_STEPS.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === stepCount - 1;
  const defaultCurrency = currencyForCountry(residentCountry);

  useEffect(() => {
    if (!state?.success) {
      return;
    }

    toast.success("Client profile created");
    router.push("/clients");
  }, [router, state?.success]);

  function handleNext() {
    setCurrentStep((step) => Math.min(step + 1, stepCount - 1));
  }

  function handleBack() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="creationMode" value="direct" />

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <CreateWizardNav
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />

        <div className="min-w-0 space-y-5">
          <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 xl:hidden">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Step {currentStep + 1} of {stepCount}
            </p>
            <p className="mt-1 text-sm font-medium">
              {CREATE_CLIENT_WIZARD_STEPS[currentStep]?.label}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {CREATE_CLIENT_WIZARD_STEPS[currentStep]?.description}
            </p>
          </div>

          <fieldset
            data-wizard-step
            className={cn("min-w-0 border-0 p-0 m-0", currentStep !== 0 && "hidden")}
          >
            <div className="space-y-5">
              <CreateFormSection
                id="identity"
                title="Identity"
                description="Account credentials and location. The client can log in with email OTP once provisioned."
              >
                <IdentityFields
                  errors={state?.errors}
                  accountMode={accountMode}
                  onAccountModeChange={setAccountMode}
                  onCountryChange={setResidentCountry}
                />
              </CreateFormSection>

              <CreateFormSection
                id="profile"
                title="Profile & risk"
                description="Risk profile, objectives, and household details for suitability."
              >
                <ProfileFields errors={state?.errors} isSolo={accountMode === "solo"} />
              </CreateFormSection>
            </div>
          </fieldset>

          <fieldset
            data-wizard-step
            className={cn("min-w-0 border-0 p-0 m-0", currentStep !== 1 && "hidden")}
          >
            <PlanFields accountMode={accountMode} defaultCurrency={defaultCurrency} />
          </fieldset>

          <fieldset
            data-wizard-step
            className={cn("min-w-0 border-0 p-0 m-0", currentStep !== 2 && "hidden")}
          >
            <HoldingsFields currency={defaultCurrency} />
          </fieldset>

          <fieldset
            data-wizard-step
            className={cn("min-w-0 border-0 p-0 m-0", currentStep !== 3 && "hidden")}
          >
            <DebtInsuranceFields currency={defaultCurrency} />
          </fieldset>

          <fieldset
            data-wizard-step
            className={cn("min-w-0 border-0 p-0 m-0", currentStep !== 4 && "hidden")}
          >
            <CreateFormSection
              id="access"
              title="Access & assignment"
              description="Assign an advisor and grant Core access so the client can reach a populated dashboard."
            >
              <CreateClientAdminFields
                canManageSubscriptions={canManageSubscriptions}
                advisors={advisors}
                durationError={state?.errors?.durationDays?.[0]}
              />
            </CreateFormSection>
          </fieldset>

          {state?.message && !state.success ? (
            <p
              className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {state.message}
            </p>
          ) : null}

          <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-2 rounded-xl border border-border/60 bg-background/95 p-4 shadow-sm backdrop-blur sm:flex-row sm:justify-between">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" render={<Link href="/clients" />}>
                Cancel
              </Button>
              {!isFirstStep ? (
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
              ) : null}
            </div>
            {isLastStep ? (
              <Button type="submit" disabled={pending}>
                {pending ? "Creating client..." : "Create fully populated client"}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
