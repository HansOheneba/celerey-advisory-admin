"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

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
import type { ProfileWriteResult } from "@/lib/demo/profile-types";

type ProfileEditorDialogProps = {
  title: string;
  description: string;
  triggerLabel: string;
  submitLabel?: string;
  clientId: string;
  action: (formData: FormData) => Promise<ProfileWriteResult>;
  children: ReactNode;
  successMessage: string;
  contentClassName?: string;
};

export function ProfileEditorDialog({
  title,
  description,
  triggerLabel,
  submitLabel = "Save",
  clientId,
  action,
  children,
  successMessage,
  contentClassName,
}: ProfileEditorDialogProps) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(successMessage);
      setOpen(false);
    });
  }

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
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className={contentClassName ?? "sm:max-w-lg"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form key={formKey} action={submit} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          {children}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
