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

function AddClientForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(createClientAction, undefined);

  useEffect(() => {
    if (!state?.success) {
      return;
    }

    toast.success("Client created");
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
          {pending ? "Creating..." : "Create client"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddClientDialog() {
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
            Create a new client with their name and email. They start in
            onboarding.
          </DialogDescription>
        </DialogHeader>
        <AddClientForm key={formKey} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
