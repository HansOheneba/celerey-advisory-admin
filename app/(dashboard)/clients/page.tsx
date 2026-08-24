import type { Metadata } from "next";
import { Suspense } from "react";
import { AddClientDialog } from "@/components/clients/add-client-dialog";
import { ClientsTable } from "@/components/clients/clients-table";
import { ClientsTableSkeleton } from "@/components/clients/clients-table-skeleton";
import { mergeAssignableAdvisors } from "@/lib/advisors/assignable";
import { isAdmin } from "@/lib/auth/roles";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { requireSession } from "@/lib/dal";
import { listAdvisors } from "@/lib/repositories/advisors";
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
  const admin = isAdmin(session.role);
  const params = await searchParams;

  const query = params.query ?? "";
  const status = params.status ?? "all";
  const riskLevel = params.riskLevel ?? "all";
  const sortBy =
    params.sortBy === "aua" ||
    params.sortBy === "lastContactAt" ||
    params.sortBy === "nextReviewAt"
      ? params.sortBy
      : "name";
  const sortDir = params.sortDir === "desc" ? "desc" : "asc";
  const page = Number(params.page ?? "1") || 1;

  const [result, advisorsResult] = await Promise.all([
    listClients({
      query,
      status,
      riskLevel,
      sortBy,
      sortDir,
      page,
      pageSize: 10,
    }),
    admin
      ? listAdvisors({ page: 1, pageSize: 100 }).catch(() => ({
          items: [],
          total: 0,
          page: 1,
          pageSize: 100,
          pageCount: 1,
        }))
      : Promise.resolve({
          items: [],
          total: 0,
          page: 1,
          pageSize: 100,
          pageCount: 1,
        }),
  ]);

  return (
    <div className={dashboardTheme.page}>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-0.5">
          <p className={dashboardTheme.sectionLabel}>Client book</p>
          <h2 className={dashboardTheme.pageTitle}>Clients</h2>
          <p className={dashboardTheme.pageDescription}>
            {admin
              ? "Browse relationships, assign advisors, and keep reviews moving forward."
              : "Browse your assigned relationships and keep reviews moving forward."}
          </p>
        </div>
        <AddClientDialog
          canManageSubscriptions={admin}
          advisors={mergeAssignableAdvisors(advisorsResult.items, session)}
        />
      </section>

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
          canManageSubscriptions={admin}
          showAdvisorColumn={admin}
        />
      </Suspense>
    </div>
  );
}
