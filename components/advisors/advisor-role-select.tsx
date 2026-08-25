"use client";

import { useState, useTransition } from "react";
import { ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { updateStaffRolesAction } from "@/app/actions/advisors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IDENTITY_ROLES,
  identityRoleLabel,
  parseIdentityRoles,
  rolesFromPrimary,
  type AppRole,
  type IdentityRole,
} from "@/lib/auth/roles";

const ROLE_OPTIONS: {
  value: IdentityRole;
  description: string;
}[] = [
  {
    value: "client",
    description: "Can sign in to the client app.",
  },
  {
    value: "advisor",
    description: "Own-book access in the portal.",
  },
  {
    value: "admin",
    description: "Firm-wide portal access.",
  },
  {
    value: "super_admin",
    description: "Can grant and revoke roles.",
  },
];

type AdvisorRoleSelectProps = {
  advisorId: string;
  role: AppRole;
  roles?: IdentityRole[];
  canManageRoles: boolean;
  isSelf?: boolean;
};

function resolveRoles(role: AppRole, roles?: IdentityRole[]) {
  const parsed = parseIdentityRoles(roles ?? []);
  return parsed.length > 0 ? parsed : rolesFromPrimary(role);
}

function roleBadgeVariant(role: IdentityRole) {
  if (role === "client") {
    return "outline" as const;
  }

  if (role === "admin" || role === "super_admin") {
    return "default" as const;
  }

  return "secondary" as const;
}

function RoleBadges({ roles }: { roles: IdentityRole[] }) {
  return (
    <span className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <Badge key={role} variant={roleBadgeVariant(role)}>
          {identityRoleLabel(role)}
        </Badge>
      ))}
    </span>
  );
}

export function AdvisorRoleSelect({
  advisorId,
  role,
  roles,
  canManageRoles,
  isSelf = false,
}: AdvisorRoleSelectProps) {
  const currentRoles = resolveRoles(role, roles);
  const addableRoles = ROLE_OPTIONS.filter((option) => {
    if (isSelf && option.value === "super_admin") {
      return false;
    }

    return !currentRoles.includes(option.value);
  });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<IdentityRole[]>(
    isSelf ? [] : currentRoles,
  );
  const [pending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(isSelf ? [] : resolveRoles(role, roles));
    }
    setOpen(nextOpen);
  }

  function toggleRole(nextRole: IdentityRole, checked: boolean) {
    setDraft((current) => {
      if (checked) {
        return IDENTITY_ROLES.filter(
          (value) => value === nextRole || current.includes(value),
        );
      }

      return current.filter((value) => value !== nextRole);
    });
  }

  function handleSave() {
    const nextRoles = isSelf
      ? parseIdentityRoles([...currentRoles, ...draft])
      : draft;

    if (nextRoles.length === 0) {
      toast.error("Choose at least one role.");
      return;
    }

    if (isSelf && draft.length === 0) {
      toast.error("Choose a role to add.");
      return;
    }

    startTransition(async () => {
      const result = await updateStaffRolesAction({
        staffId: advisorId,
        roles: nextRoles,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(isSelf ? "Roles added" : "Roles updated");
      setOpen(false);
    });
  }

  if (!canManageRoles || (isSelf && addableRoles.length === 0)) {
    return <RoleBadges roles={currentRoles} />;
  }

  const options = isSelf ? addableRoles : ROLE_OPTIONS;
  const saveDisabled = pending || (isSelf ? draft.length === 0 : draft.length === 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-auto max-w-full gap-1.5 py-1"
            aria-label={isSelf ? "Add roles" : "Edit roles"}
          >
            <RoleBadges roles={currentRoles} />
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isSelf ? "Add roles" : "Roles"}</DialogTitle>
          <DialogDescription>
            {isSelf
              ? "These are added to the roles you already have. Super admin on your own account stays as-is."
              : "A person can hold more than one role. Check every hat they should have, including Client for the client app."}
          </DialogDescription>
        </DialogHeader>
        {isSelf ? (
          <div className="space-y-1">
            <p className="px-2 text-xs font-medium text-muted-foreground">
              Already have
            </p>
            <div className="px-2 pb-2">
              <RoleBadges roles={currentRoles} />
            </div>
          </div>
        ) : null}
        <div className="space-y-1">
          {options.map((option) => {
            const checked = draft.includes(option.value);
            const checkboxId = `role-${advisorId}-${option.value}`;

            return (
              <div
                key={option.value}
                className="flex items-start gap-3 rounded-lg px-2 py-2"
              >
                <Checkbox
                  id={checkboxId}
                  checked={checked}
                  onCheckedChange={(value) =>
                    toggleRole(option.value, value === true)
                  }
                  className="mt-0.5"
                />
                <label htmlFor={checkboxId} className="min-w-0 cursor-pointer">
                  <span className="block text-sm font-medium">
                    {identityRoleLabel(option.value)}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
        {isSelf && draft.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Choose at least one extra role to add.
          </p>
        ) : null}
        {!isSelf && draft.length === 0 ? (
          <p className="text-xs text-destructive">Choose at least one role.</p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saveDisabled}>
            {pending ? "Saving..." : isSelf ? "Add roles" : "Save roles"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
