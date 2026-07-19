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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CORE_DURATION_PRESETS,
  DEFAULT_CORE_DURATION_DAYS,
  DEFAULT_CORE_DURATION_PRESET_KEY,
  type CoreDurationPresetKey,
} from "@/lib/definitions";

function AddClientForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(createClientAction, undefined);
  const [grantCore, setGrantCore] = useState(true);
  const [durationPreset, setDurationPreset] = useState<CoreDurationPresetKey>(
    DEFAULT_CORE_DURATION_PRESET_KEY,
  );
  const [customDays, setCustomDays] = useState(DEFAULT_CORE_DURATION_DAYS);
  const isCustomDuration = durationPreset === "custom";
  const durationDays = isCustomDuration
    ? customDays
    : String(
        CORE_DURATION_PRESETS.find((preset) => preset.key === durationPreset)
          ?.days ?? DEFAULT_CORE_DURATION_DAYS,
      );

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

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+14155550100"
          aria-invalid={Boolean(state?.errors?.phone)}
        />
        {state?.errors?.phone ? (
          <p className="text-xs text-destructive">{state.errors.phone[0]}</p>
        ) : null}
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
          <div className="space-y-2 pl-7">
            <Label htmlFor="durationPreset">Core subscription length</Label>
            <Select
              value={durationPreset}
              onValueChange={(next) =>
                setDurationPreset(
                  (next as CoreDurationPresetKey) ?? durationPreset,
                )
              }
            >
              <SelectTrigger id="durationPreset" className="w-full">
                <SelectValue>
                  {(value: CoreDurationPresetKey | null) =>
                    CORE_DURATION_PRESETS.find((preset) => preset.key === value)
                      ?.label ?? "Select duration"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CORE_DURATION_PRESETS.map((preset) => (
                  <SelectItem key={preset.key} value={preset.key}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isCustomDuration ? (
              <div className="space-y-1">
                <Label htmlFor="customDuration">Duration (days)</Label>
                <Input
                  id="customDuration"
                  type="number"
                  min={1}
                  max={3650}
                  value={customDays}
                  onChange={(event) => setCustomDays(event.target.value)}
                  aria-invalid={Boolean(state?.errors?.durationDays)}
                />
              </div>
            ) : null}

            {state?.errors?.durationDays ? (
              <p className="text-xs text-destructive">
                {state.errors.durationDays[0]}
              </p>
            ) : null}

            <input type="hidden" name="duration" value={durationDays} />
          </div>
        ) : null}
      </div>

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
            Create a stub client for onboarding and optionally grant Celerey
            Core right away.
          </DialogDescription>
        </DialogHeader>
        <AddClientForm key={formKey} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
