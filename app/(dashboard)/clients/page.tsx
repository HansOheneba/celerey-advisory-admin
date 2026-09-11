import type { Metadata } from "next";
import { Suspense } from "react";
import { Users } from "lucide-react";
import { AddClientButton } from "@/components/clients/add-client-button";
import { ClientsTable } from "@/components/clients/clients-table";
import { ClientsTableSkeleton } from "@/components/clients/clients-table-skeleton";
import { BookAssetsCard } from "@/components/shared/book-assets-card";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { hasCapability, showsAssignedAdvisor } from "@/lib/auth/capabilities";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { requireSession } from "@/lib/dal";
import { getBookMetrics } from "@/lib/demo/repositories";
import { listClients } from "@/lib/repositories/clients";

export const metadata: Metadata = {
  title: "Clients",
};

type ClientsPageProps = {
  searchParams: Promise<{
    query?: string;
    status?: string;
    riskLevel?: string;
    sortBy?: string;
    sortDir?: string;
    page?: string;
  }>;
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const session = await requireSession();
  const canCreate = hasCapability(session.capabilities, "create_client");
  const canAssign = hasCapability(session.capabilities, "assign_advisor");
  const showAssignedAdvisor = showsAssignedAdvisor(session.capabilities.scope);
  const params = await searchParams;

  const query = params.query ?? "";
  const status = params.status ?? "all";
  const riskLevel = params.riskLevel ?? "all";
  const sortBy =
    params.sortBy === "name" ||
    params.sortBy === "aua" ||
    params.sortBy === "aum" ||
    params.sortBy === "lastContactAt" ||
    params.sortBy === "nextReviewAt" ||
    params.sortBy === "joinedAt"
      ? params.sortBy
      : "aua";
  const sortDir =
    params.sortDir === "asc"
      ? "asc"
      : params.sortDir === "desc"
        ? "desc"
        : sortBy === "joinedAt" || sortBy === "aua" || sortBy === "aum"
          ? "desc"
          : "asc";
  const page = Number(params.page ?? "1") || 1;

  const [result, metrics] = await Promise.all([
    listClients({
      query,
      status,
      riskLevel,
      sortBy,
      sortDir,
      page,
      pageSize: 20,
    }),
    getBookMetrics(),
  ]);

  return (
    <div className={dashboardTheme.pageContainer}>
      <PageHeader
        eyebrow="Client book"
        title="Clients"
        description={
          canAssign
            ? "Browse relationships, assign advisors, and keep reviews moving forward."
            : "Browse your assigned relationships and keep reviews moving forward."
        }
        icon={Users}
        actions={canCreate ? <AddClientButton /> : null}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BookAssetsCard
          className="sm:col-span-2"
          totalAua={metrics.totalAua}
          totalAum={metrics.totalAum}
          scope={session.capabilities.scope}
        />
        <MetricCard
          label="Active clients"
          value={String(metrics.activeClients)}
          hint={`${metrics.onboarding} onboarding`}
        />
        <MetricCard
          label="Reviews due"
          value={String(metrics.reviewsDue + metrics.reviewsOverdue)}
          delta={
            metrics.reviewsOverdue > 0
              ? {
                  value: `${metrics.reviewsOverdue} overdue`,
                  positive: false,
                }
              : undefined
          }
          hint="next 7 days"
          variant={metrics.reviewsOverdue > 0 ? "warning" : "default"}
        />
      </div>

      <Suspense fallback={<ClientsTableSkeleton />}>
        <ClientsTable
          items={result.items}
          total={result.total}
          page={result.page}
          pageSize={result.pageSize}
          pageCount={result.pageCount}
          query={query}
          status={status}
          riskLevel={riskLevel}
          sortBy={sortBy}
          sortDir={sortDir}
          canManageSubscriptions={canAssign}
          showAdvisorColumn={showAssignedAdvisor}
        />
      </Suspense>
    </div>
  );
}
