import type { Metadata } from "next";
import { Suspense } from "react";
import { AddClientDialog } from "@/components/clients/add-client-dialog";
import { ClientsTable } from "@/components/clients/clients-table";
import { ClientsTableSkeleton } from "@/components/clients/clients-table-skeleton";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { requireSession } from "@/lib/dal";
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
  await requireSession();
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

  const result = await listClients({
    query,
    status,
    riskLevel,
    sortBy,
    sortDir,
    page,
    pageSize: 10,
  });

  return (
    <div className={dashboardTheme.page}>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className={dashboardTheme.sectionLabel}>Client book</p>
          <h2 className="text-2xl font-semibold tracking-tight">Clients</h2>
          <p className="text-sm text-muted-foreground">
            Browse relationships, filter by status and risk, and keep reviews
            moving forward.
          </p>
        </div>
        <AddClientDialog />
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
        />
      </Suspense>
    </div>
  );
}
