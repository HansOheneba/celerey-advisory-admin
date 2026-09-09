"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { NotificationCenter } from "@/components/app-shell/notification-center";
import { RoleSwitcher } from "@/components/app-shell/role-switcher";
import { UserMenu } from "@/components/app-shell/user-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { AdvisorSession } from "@/lib/dal";
import type { DemoAlert } from "@/lib/demo/types";
import { ROUTE_LABELS } from "@/lib/navigation";

const SCOPE_LABELS = {
  own_book: "Own book",
  team: "Team book",
  firm: "Firm-wide",
} as const;

function breadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Overview", href: "/dashboard", current: true }];
  }

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isEntityId =
      (segments[0] === "clients" || segments[0] === "advisors") &&
      index === 1;

    return {
      label: isEntityId
        ? "Profile"
        : (ROUTE_LABELS[segment] ??
          segment.charAt(0).toUpperCase() + segment.slice(1)),
      href,
      current: index === segments.length - 1,
    };
  });
}

type AppTopbarProps = {
  session: AdvisorSession;
  alerts: DemoAlert[];
};

export function AppTopbar({ session, alerts }: AppTopbarProps) {
  const pathname = usePathname();
  const crumbs = breadcrumbs(pathname);
  const { capabilities } = session;

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-card/95 px-4 shadow-[0_1px_0_0_var(--surface-brand)] backdrop-blur sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="my-2.5 hidden h-6 sm:block"
      />

      <Breadcrumb className="hidden min-w-0 flex-1 md:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard" />}>
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          {crumbs.map((crumb) => (
            <Fragment key={crumb.href}>
              <BreadcrumbSeparator />
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

      <form
        action="/clients"
        className="ml-auto hidden max-w-xs flex-1 lg:block xl:max-w-sm"
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            name="query"
            placeholder="Search clients"
            aria-label="Search clients"
            className="border-primary/15 bg-surface-brand pl-9 focus-visible:border-primary/30 focus-visible:ring-primary/20"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
        <span className="hidden rounded-full border border-primary/15 bg-surface-brand px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-primary/80 xl:inline">
          {SCOPE_LABELS[capabilities.scope]}
        </span>
        <NotificationCenter alerts={alerts} />
        <RoleSwitcher activeRole={capabilities.role} />
        <UserMenu
          name={session.name}
          email={session.email}
          roleLabel={capabilities.label}
        />
      </div>
    </header>
  );
}
