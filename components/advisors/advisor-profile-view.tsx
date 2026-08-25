import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdvisorClientsTable } from "@/components/advisors/advisor-clients-table";
import { AdvisorRoleSelect } from "@/components/advisors/advisor-role-select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { identityRoleLabel, roleLabel } from "@/lib/auth/roles";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Advisor } from "@/types/advisor";
import type { Client } from "@/types/client";

type AdvisorProfileViewProps = {
  advisor: Advisor;
  clients: Client[];
  totalClients: number;
  canManageRoles?: boolean;
  isSelf?: boolean;
};

function advisorInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return getInitials(parts[0], "");
  }
  return getInitials(parts[0], parts[parts.length - 1]);
}

export function AdvisorProfileView({
  advisor,
  clients,
  totalClients,
  canManageRoles = false,
  isSelf = false,
}: AdvisorProfileViewProps) {
  return (
    <div className={dashboardTheme.page}>
      <div>
        <Link
          href="/advisors"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 mb-2")}
        >
          <ArrowLeft />
          All advisors
        </Link>
      </div>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar size="lg">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {advisorInitials(advisor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className={dashboardTheme.pageTitle}>{advisor.name}</h2>
              <AdvisorRoleSelect
                advisorId={advisor.id}
                role={advisor.role}
                roles={advisor.roles}
                canManageRoles={canManageRoles}
                isSelf={isSelf}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {advisor.email || "No email on file"}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalClients} assigned client{totalClients === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className={dashboardTheme.card}>
          <CardHeader className="pb-2">
            <p className={dashboardTheme.sectionLabel}>Book</p>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {totalClients}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Clients currently assigned to this advisor
          </CardContent>
        </Card>
        <Card className={dashboardTheme.card}>
          <CardHeader className="pb-2">
            <p className={dashboardTheme.sectionLabel}>Role</p>
            <CardTitle className="text-2xl font-semibold">
              {advisor.roles.length > 0
                ? advisor.roles.map(identityRoleLabel).join(" · ")
                : roleLabel(advisor.role)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {advisor.role === "super_admin"
              ? "Full firm-wide access, including role management."
              : advisor.role === "admin"
                ? "Firm-wide access and can hold a personal book."
                : "Sees only assigned clients and their dashboard."}
            {advisor.roles.includes("client")
              ? " Includes client-app access on this identity."
              : ""}
          </CardContent>
        </Card>
        <Card className={dashboardTheme.card}>
          <CardHeader className="pb-2">
            <p className={dashboardTheme.sectionLabel}>Contact</p>
            <CardTitle className="truncate text-base font-semibold">
              {advisor.email || "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Work email used for advisor access
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="space-y-0.5">
          <p className={dashboardTheme.sectionLabel}>Assigned book</p>
          <h3 className="text-base font-semibold tracking-tight">Clients</h3>
        </div>
        <AdvisorClientsTable items={clients} />
      </section>
    </div>
  );
}
