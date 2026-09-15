"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createAdvisorAction } from "@/app/actions/advisors";
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

function AddAdvisorForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    createAdvisorAction,
    undefined,
  );
  const [role, setRole] = useState<"advisor" | "admin">("advisor");

  useEffect(() => {
    if (!state?.success) {
      return;
    }

    toast.success("Advisor created");
    onSuccess();
  }, [state?.success, onSuccess]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="role" value={role} />

      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Amara Mensah"
          required
          aria-invalid={Boolean(state?.errors?.name)}
        />
        {state?.errors?.name ? (
          <p className="text-xs text-destructive">{state.errors.name[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="amara@company.com"
          required
          aria-invalid={Boolean(state?.errors?.email)}
        />
        {state?.errors?.email ? (
          <p className="text-xs text-destructive">{state.errors.email[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={role}
          onValueChange={(value) =>
            setRole((value as "advisor" | "admin") ?? "advisor")
          }
        >
          <SelectTrigger id="role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="advisor">Advisor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {state?.message && !state.success ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create advisor"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddAdvisorDialog() {
  const [open, setOpen] = useState(false);
  const handleSuccess = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button">
            <Plus />
            Add advisor
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add advisor</DialogTitle>
          <DialogDescription>
            Creates their account. They&apos;ll get an email with a link to
            verify access and add their profile details.
          </DialogDescription>
        </DialogHeader>
        <AddAdvisorForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
