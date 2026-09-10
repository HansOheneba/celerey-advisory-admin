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
    <header className="sticky top-0 z-20 shrink-0 border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="flex h-14 items-center gap-3 px-4 md:px-5">
        <SidebarTrigger className="shrink-0" />

        <Breadcrumb className="hidden min-w-0 flex-1 text-sm md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-muted-foreground"
                render={<Link href="/dashboard" />}
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            {crumbs.map((crumb) => (
              <Fragment key={crumb.href}>
                <BreadcrumbSeparator className="[&>svg]:size-3.5 [&>svg]:text-muted-foreground" />
                <BreadcrumbItem>
                  {crumb.current ? (
                    <BreadcrumbPage className="font-medium text-foreground">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      className="text-muted-foreground"
                      render={<Link href={crumb.href} />}
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <form action="/clients" className="hidden w-[200px] lg:block xl:w-[240px]">
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

          <span className="hidden rounded-md border border-primary/15 bg-surface-brand px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-primary/80 xl:inline">
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
      </div>
    </header>
  );
}
