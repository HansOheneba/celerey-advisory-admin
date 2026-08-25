"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateClientSubscriptionAction } from "@/app/actions/clients";
import { CoreDurationFields } from "@/components/clients/core-duration-fields";
import { SubscriptionBadge } from "@/components/clients/subscription-badge";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClientSubscription } from "@/types/client";

type EditSubscriptionDialogProps = {
  clientId: string;
  subscription: ClientSubscription;
};

function SubscriptionForm({
  clientId,
  subscription,
  onSuccess,
}: {
  clientId: string;
  subscription: ClientSubscription;
  onSuccess: () => void;
}) {
  const [value, setValue] = useState<ClientSubscription>(subscription);
  const [state, action, pending] = useActionState(
    updateClientSubscriptionAction,
    undefined,
  );

  useEffect(() => {
    if (!state?.success) {
      return;
    }

    toast.success("Subscription updated");
    onSuccess();
  }, [state?.success, onSuccess]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="subscription" value={value} />

      <div className="space-y-2">
        <Label htmlFor="subscription">Subscription</Label>
        <Select
          value={value}
          onValueChange={(next) =>
            setValue((next as ClientSubscription) ?? value)
          }
        >
          <SelectTrigger id="subscription" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_onboarded">Not onboarded</SelectItem>
            <SelectItem value="free_trial">Free trial</SelectItem>
            <SelectItem value="celerey_core">Celerey Core</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value === "celerey_core" ? (
        <CoreDurationFields error={state?.errors?.durationDays?.[0]} />
      ) : null}

      {state?.message && !state.success ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save subscription"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditSubscriptionDialog({
  clientId,
  subscription,
}: EditSubscriptionDialogProps) {
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
      <div className="flex flex-wrap items-center gap-2">
        <SubscriptionBadge subscription={subscription} />
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          Edit subscription
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit subscription</DialogTitle>
          <DialogDescription>
            Set Not onboarded, Free trial, or Celerey Core. Core requires a
            subscription length.
          </DialogDescription>
        </DialogHeader>

        <SubscriptionForm
          key={formKey}
          clientId={clientId}
          subscription={subscription}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
