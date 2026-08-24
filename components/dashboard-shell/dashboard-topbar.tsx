"use client";

import { Fragment, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, Check, ChevronsUpDown, LogOut, UserRoundCog } from "lucide-react";
import { logout, switchActingRoleAction } from "@/app/actions/auth";
import {
  canSwitchActingRole,
  isAdmin,
  roleLabel,
  type StaffRole,
} from "@/lib/auth/roles";
import type { AdvisorSession } from "@/lib/dal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  clients: "Clients",
  advisors: "Advisors",
  assignments: "Assignments",
  messages: "Messages",
  appointments: "Appointments",
  tasks: "Tasks",
  reports: "Reports",
  settings: "Settings",
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Dashboard", href: "/dashboard", current: true }];
  }

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isClientId = segments[0] === "clients" && index === 1;
    const isAdvisorId = segments[0] === "advisors" && index === 1;
    const label =
      isClientId || isAdvisorId
        ? "Profile"
        : (routeLabels[segment] ??
          segment.charAt(0).toUpperCase() + segment.slice(1));

    return {
      label,
      href,
      current: index === segments.length - 1,
    };
  });
}

type DashboardTopbarProps = {
  advisor: AdvisorSession;
};

export function DashboardTopbar({ advisor }: DashboardTopbarProps) {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);
  const initials = advisor.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 border-b border-border/50 bg-[var(--dashboard-surface)]/90 px-4 backdrop-blur sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 hidden my-2.5 sm:block" />

      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden sm:inline-flex">
            <BreadcrumbLink render={<Link href="/dashboard" />}>
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          {crumbs.map((crumb) => (
            <Fragment key={crumb.href}>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                {crumb.current ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative shrink-0"
        aria-label="Notifications"
      >
        <Bell />
        <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              className="h-8 gap-2 px-1.5 sm:px-2"
              aria-label="Account menu"
            />
          }
        >
          <Avatar size="sm">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 text-left sm:grid">
            <span className="truncate text-sm font-medium leading-tight">
              {advisor.name}
            </span>
            <span className="truncate text-[11px] leading-tight text-muted-foreground">
              {roleLabel(advisor.role)}
            </span>
          </span>
          <ChevronsUpDown className="hidden size-3.5 text-muted-foreground sm:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{advisor.name}</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {advisor.email}
                </p>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {isAdmin(advisor.role) ? (
            <DropdownMenuItem render={<Link href="/advisors" />}>
              <UserRoundCog />
              Advisors
            </DropdownMenuItem>
          ) : null}
          <ActingRoleSwitcher advisor={advisor} />
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function actingRoleOptions(advisor: AdvisorSession) {
  const options: { role: StaffRole; label: string; description: string }[] = [
    {
      role: "advisor",
      label: "Advisor",
      description: "Your own book",
    },
  ];

  if (
    advisor.isSuperAdmin ||
    advisor.trueRoles.includes("admin") ||
    advisor.availableRoles.includes("admin")
  ) {
    options.push({
      role: "admin",
      label: "Admin",
      description: "Firm-wide access",
    });
  }

  if (advisor.isSuperAdmin) {
    options.push({
      role: "super_admin",
      label: "Super admin",
      description: "Full access",
    });
  }

  return options;
}

function ActingRoleSwitcher({ advisor }: { advisor: AdvisorSession }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!canSwitchActingRole(advisor)) {
    return null;
  }

  function handleSwitch(role: StaffRole) {
    if (role === advisor.role || pending) {
      return;
    }

    startTransition(async () => {
      const result = await switchActingRoleAction(role);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel>View as</DropdownMenuLabel>
        {actingRoleOptions(advisor).map((option) => (
          <DropdownMenuItem
            key={option.role}
            disabled={pending}
            onClick={() => handleSwitch(option.role)}
          >
            <Check
              className={
                option.role === advisor.role ? "opacity-100" : "opacity-0"
              }
            />
            <span className="flex min-w-0 flex-col">
              <span>{option.label}</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                {option.description}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
    </>
  );
}
