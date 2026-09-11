"use client";

import { useTransition } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { switchDemoRole } from "@/app/actions/demo-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DEMO_ROLES,
  roleDefinition,
  type DemoRole,
} from "@/lib/auth/capabilities";
import { cn } from "@/lib/utils";

type RoleSwitcherProps = {
  activeRole: DemoRole;
};

/** Demo only: switch acting role without signing out. */
export function RoleSwitcher({ activeRole }: RoleSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const active = roleDefinition(activeRole);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            className="gap-2"
          />
        }
      >
        <span className="hidden sm:inline">{active.label}</span>
        <span className="sm:hidden">Role</span>
        <ChevronsUpDown className="size-3.5 opacity-60" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Acting role</DropdownMenuLabel>
          {DEMO_ROLES.map((role) => {
            const definition = roleDefinition(role);
            const isActive = role === activeRole;

            return (
              <DropdownMenuItem
                key={role}
                disabled={isPending}
                onClick={() => {
                  if (isActive) return;
                  startTransition(async () => {
                    await switchDemoRole(role);
                  });
                }}
                className="items-start gap-2 py-2"
              >
                <Check
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{definition.label}</span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {definition.mission}
                  </span>
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
