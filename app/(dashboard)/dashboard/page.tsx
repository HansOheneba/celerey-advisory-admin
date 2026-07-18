import type { Metadata } from "next";
import { CalendarClock, CircleDollarSign, UserPlus, Users } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatCompactCurrency } from "@/lib/format";
import { requireSession } from "@/lib/dal";
import {
  getDashboardSummary,
  getRecentClients,
} from "@/lib/repositories/clients";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const advisor = await requireSession();
  const [summary, recentClients] = await Promise.all([
    getDashboardSummary(),
    getRecentClients(5),
  ]);

  return (
    <div className={dashboardTheme.page}>
      <section className="space-y-1">
        <p className={dashboardTheme.sectionLabel}>At a glance</p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome back, {advisor.name.split(" ")[0]}
        </h2>
        <p className="text-sm text-muted-foreground">
          Track client health, upcoming reviews, and book-level AUA from one
          calm workspace designed for advisory operations.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total clients"
          value={String(summary.totalClients)}
          hint={`${summary.activeClients} currently active`}
          icon={<Users className="size-4" />}
        />
        <KpiCard
          label="Book AUA"
          value={formatCompactCurrency(summary.totalAua)}
          hint={`Avg ${formatCompactCurrency(summary.averageAua)} per client`}
          icon={<CircleDollarSign className="size-4" />}
        />
        <KpiCard
          label="Reviews this week"
          value={String(summary.reviewsDueThisWeek)}
          hint="Keep relationships on schedule"
          icon={<CalendarClock className="size-4" />}
        />
        <KpiCard
          label="Onboarding"
          value={String(summary.onboardingCount)}
          hint="New relationships in progress"
          icon={<UserPlus className="size-4" />}
        />
      </section>

      <DashboardCharts summary={summary} />
      <RecentActivity
        activity={summary.recentActivity}
        recentClients={recentClients}
      />
    </div>
  );
}
