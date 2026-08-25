"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createClientAction } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdvisorSelect, UNASSIGNED_ADVISOR_VALUE } from "@/components/advisors/advisor-select";
import { CoreDurationFields } from "@/components/clients/core-duration-fields";
import { DEFAULT_CORE_DURATION_DAYS } from "@/lib/definitions";
import type { Advisor } from "@/types/advisor";

type AddClientFormProps = {
  onSuccess: () => void;
  canManageSubscriptions: boolean;
  advisors: Advisor[];
};

function AddClientForm({
  onSuccess,
  canManageSubscriptions,
  advisors,
}: AddClientFormProps) {
  const [state, action, pending] = useActionState(createClientAction, undefined);
  const [grantCore, setGrantCore] = useState(canManageSubscriptions);
  const [advisorId, setAdvisorId] = useState(UNASSIGNED_ADVISOR_VALUE);

  useEffect(() => {
    if (!state?.success) {
      return;
    }

    toast.success("Client created and invite sent");
    onSuccess();
  }, [state?.success, onSuccess]);

  return (
    <form action={action} className="space-y-4">
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
          {state?.errors?.firstName ? (
            <p className="text-xs text-destructive">
              {state.errors.firstName[0]}
            </p>
          ) : null}
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
          {state?.errors?.lastName ? (
            <p className="text-xs text-destructive">
              {state.errors.lastName[0]}
            </p>
          ) : null}
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
          aria-invalid={Boolean(state?.errors?.email)}
        />
        {state?.errors?.email ? (
          <p className="text-xs text-destructive">{state.errors.email[0]}</p>
        ) : null}
      </div>

      {canManageSubscriptions ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="advisorId">Assign advisor</Label>
            <input
              type="hidden"
              name="advisorId"
              value={advisorId === UNASSIGNED_ADVISOR_VALUE ? "" : advisorId}
            />
            <AdvisorSelect
              id="advisorId"
              advisors={advisors}
              value={advisorId}
              onValueChange={(next) =>
                setAdvisorId(next || UNASSIGNED_ADVISOR_VALUE)
              }
              includeUnassigned
              showWorkload
              placeholder="Unassigned"
            />
          </div>

          <div className="space-y-3 rounded-lg border p-3">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="grantCore"
                value="true"
                checked={grantCore}
                onChange={(event) => setGrantCore(event.target.checked)}
                className="mt-0.5 size-4 accent-primary"
              />
              <span>
                <span className="font-medium">Grant Celerey Core</span>
                <span className="mt-0.5 block text-muted-foreground">
                  Give Core access immediately (recovery / paid-offline cases).
                </span>
              </span>
            </label>

            {grantCore ? (
              <div className="pl-7">
                <CoreDurationFields error={state?.errors?.durationDays?.[0]} />
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <input type="hidden" name="duration" value={DEFAULT_CORE_DURATION_DAYS} />
      )}

      <p className="text-xs text-muted-foreground">
        The client will receive an email inviting them to complete their
        Celerey profile.
      </p>

      {state?.message && !state.success ? (
        <p
          className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <DialogFooter>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Saving..." : "Create client"}
        </Button>
      </DialogFooter>
    </form>
  );
}

type AddClientDialogProps = {
  canManageSubscriptions?: boolean;
  advisors?: Advisor[];
};

export function AddClientDialog({
  canManageSubscriptions = false,
  advisors = [],
}: AddClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const handleSuccess = useCallback(() => setOpen(false), []);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setFormKey((current) => current + 1);
        }
      }}
    >
      <DialogTrigger render={<Button className="shrink-0" />}>
        <Plus data-icon="inline-start" />
        Add client
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add client</DialogTitle>
          <DialogDescription>
            {canManageSubscriptions
              ? "Create a client, optionally assign an advisor, and grant Celerey Core."
              : "Create a client for your book. They’ll receive an invite to complete onboarding."}
          </DialogDescription>
        </DialogHeader>
        <AddClientForm
          key={formKey}
          onSuccess={handleSuccess}
          canManageSubscriptions={canManageSubscriptions}
          advisors={advisors}
        />
      </DialogContent>
    </Dialog>
  );
}
