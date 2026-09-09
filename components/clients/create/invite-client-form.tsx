"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClientAction } from "@/app/actions/clients";
import { CreateClientAdminFields } from "@/components/clients/create-client-admin-fields";
import { CreateFormSection } from "@/components/clients/create/create-form-section";
import { FieldError } from "@/components/clients/create/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Advisor } from "@/types/advisor";

type InviteClientFormProps = {
  canManageSubscriptions: boolean;
  advisors: Advisor[];
};

export function InviteClientForm({
  canManageSubscriptions,
  advisors,
}: InviteClientFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createClientAction, undefined);

  useEffect(() => {
    if (!state?.success) {
      return;
    }

    toast.success("Client created and invite sent");
    router.push("/clients");
  }, [router, state?.success]);

  return (
    <form action={action} className="mx-auto max-w-3xl space-y-5">
      <input type="hidden" name="creationMode" value="invite" />

      <CreateFormSection
        id="identity"
        title="Client details"
        description="The client receives an email invite and completes onboarding themselves."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              placeholder="Ama"
              required
              aria-invalid={Boolean(state?.errors?.firstName)}
            />
            <FieldError message={state?.errors?.firstName?.[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              placeholder="Darko"
              required
              aria-invalid={Boolean(state?.errors?.lastName)}
            />
            <FieldError message={state?.errors?.lastName?.[0]} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inviteEmail">Email</Label>
          <Input
            id="inviteEmail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="ama.darko@example.com"
            required
            aria-invalid={Boolean(state?.errors?.email)}
          />
          <FieldError message={state?.errors?.email?.[0]} />
        </div>
      </CreateFormSection>

      <CreateFormSection
        id="access"
        title="Access & assignment"
        description="Advisor assignment and Core access for recovery or offline-paid cases."
      >
        <CreateClientAdminFields
          canManageSubscriptions={canManageSubscriptions}
          advisors={advisors}
          durationError={state?.errors?.durationDays?.[0]}
        />
      </CreateFormSection>

      {state?.message && !state.success ? (
        <p
          className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" render={<Link href="/clients" />}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Sending invite..." : "Create client & send invite"}
        </Button>
      </div>
    </form>
  );
}
