"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  clients: "Clients",
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Dashboard", href: "/dashboard", current: true }];
  }

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isClientId =
      segments[0] === "clients" && index === 1 && segment.startsWith("cli_");
    const label = isClientId
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

export function DashboardTopbar() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-[#f7f7f7]/90 px-4 backdrop-blur sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 hidden my-3 sm:block" />

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
    </header>
  );
}
