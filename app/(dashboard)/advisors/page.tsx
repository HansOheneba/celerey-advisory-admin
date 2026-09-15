import type { Metadata } from "next";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";
import { Suspense } from "react";
import { AddAdvisorDialog } from "@/components/advisors/add-advisor-dialog";
import { AdvisorsTable } from "@/components/advisors/advisors-table";
import { AdvisorsToolbar } from "@/components/advisors/advisors-toolbar";
import { isAdmin } from "@/lib/auth/roles";
import { requireSession } from "@/lib/dal";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { listAdvisors } from "@/lib/repositories/advisors";

export const metadata: Metadata = {
  title: "Advisors",
};

type AdvisorsPageProps = {
  searchParams: Promise<{
    query?: string;
  }>;
};

export default async function AdvisorsPage({ searchParams }: AdvisorsPageProps) {
  const session = await requireSession();
  const params = await searchParams;
  const query = params.query ?? "";

  const result = await listAdvisors({
    query,
    page: 1,
    pageSize: 50,
  });

  const canManageRoles = session.isSuperAdmin;

  return (
    <div className={dashboardTheme.page}>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-0.5">
          <SectionEyebrow>Team</SectionEyebrow>
          <h2 className={dashboardTheme.pageTitle}>Advisors</h2>
          <p className={dashboardTheme.pageDescription}>
            {canManageRoles
              ? "Browse the team and grant or revoke roles, including client-app access."
              : "Browse the team, open an advisor profile, and review the clients on their book."}
          </p>
        </div>
        {isAdmin(session.role) ? <AddAdvisorDialog /> : null}
      </section>

      <Suspense fallback={null}>
        <AdvisorsToolbar query={query} />
      </Suspense>

      <AdvisorsTable
        items={result.items}
        canManageRoles={canManageRoles}
        currentUserId={session.userId}
      />
    </div>
  );
}
