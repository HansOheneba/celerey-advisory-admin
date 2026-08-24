import type { Metadata } from "next";
import { ReportsView } from "@/components/reports/reports-view";
import { getAdvisorWorkloadApi } from "@/lib/api/dashboard";
import { isAdmin } from "@/lib/auth/roles";
import { requireSession } from "@/lib/dal";
import { getDashboardSummary } from "@/lib/repositories/clients";
import { listAdvisors } from "@/lib/repositories/advisors";
import type { Advisor } from "@/types/advisor";

export const metadata: Metadata = {
  title: "Reports",
};

export default async function ReportsPage() {
  const session = await requireSession();
  const admin = isAdmin(session.role);

  const [summary, workloadResult, advisorsResult] = await Promise.all([
    getDashboardSummary(),
    admin
      ? getAdvisorWorkloadApi(session.accessToken)
      : Promise.resolve(null),
    admin ? listAdvisors({ page: 1, pageSize: 100 }) : Promise.resolve(null),
  ]);

  let advisors: Advisor[] | null = null;

  if (admin) {
    if (workloadResult?.ok && workloadResult.data.items.length > 0) {
      advisors = workloadResult.data.items.map((row) => ({
        id: row.advisorId,
        name: row.advisorName,
        email: "",
        role: "advisor" as const,
        roles: ["advisor"],
        clientCount: row.clientCount,
      }));
    } else {
      advisors = advisorsResult?.items ?? [];
    }
  }

  return <ReportsView summary={summary} advisors={advisors} />;
}
