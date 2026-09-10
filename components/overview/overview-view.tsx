import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { AgeDistributionPanel } from "@/components/insights/age-distribution-panel";
import { BookCompositionPanel } from "@/components/overview/book-composition-panel";
import { GhanaRegionalMap } from "@/components/overview/ghana-regional-map";
import { NeedsAttentionSection } from "@/components/overview/needs-attention-section";
import { RecentActivitySection } from "@/components/overview/recent-activity-section";
import { UpcomingSection } from "@/components/overview/upcoming-section";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid } from "@/components/shared/stat-grid";
import { Button } from "@/components/ui/button";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatCompactCurrency } from "@/lib/format";
import { type BookMetrics } from "@/lib/demo/insights";
import {
  computeAgeAnalytics,
  computeGhanaRegionalSpread,
} from "@/lib/overview/book-analytics";
import {
  buildAttentionRows,
  buildUpcomingItems,
  computeBookComposition,
  overviewGreeting,
} from "@/lib/overview/overview-helpers";
import type { DemoAlert, DemoClientRecord } from "@/lib/demo/types";
import type { Appointment } from "@/lib/appointments/types";
import type { Task } from "@/lib/tasks/types";
import type { ClientActivity } from "@/types/client";
import type { CapabilitySet } from "@/lib/auth/capabilities";

type OverviewViewProps = {
  advisorName: string;
  capabilities: CapabilitySet;
  metrics: BookMetrics;
  records: DemoClientRecord[];
  alerts: DemoAlert[];
  activity: ClientActivity[];
  appointments: Appointment[];
  tasks: Task[];
};

export function OverviewView({
  advisorName,
  capabilities,
  metrics,
  records,
  alerts,
  activity,
  appointments,
  tasks,
}: OverviewViewProps) {
  const firstName = advisorName.split(" ")[0];
  const attentionRows = buildAttentionRows(alerts, appointments);
  const bookComposition = computeBookComposition(records);
  const ghanaSpread = computeGhanaRegionalSpread(records);
  const ageAnalytics = computeAgeAnalytics(records);
  const upcoming = buildUpcomingItems(appointments, tasks);

  return (
    <div className={dashboardTheme.pageContainer}>
      <PageHeader
        eyebrow={capabilities.label}
        title="Overview"
        description={overviewGreeting(firstName)}
        icon={TrendingUp}
        actions={
          <Button variant="outline" render={<Link href="/clients" />}>
            View all clients
          </Button>
        }
      />

      <NeedsAttentionSection
        rows={attentionRows}
        totalCount={attentionRows.length}
      />

      <StatGrid columns={6}>
        <MetricCard
          label="Assets Under Advice"
          value={formatCompactCurrency(metrics.totalAua)}
          hint="Advised but held outside managed portfolios"
          icon={DollarSign}
          variant="info"
        />
        <MetricCard
          label="Assets Under Management"
          value={formatCompactCurrency(metrics.totalAum)}
          delta={{
            value: `${metrics.weightedPerformancePct >= 0 ? "+" : ""}${metrics.weightedPerformancePct}% TTM`,
            positive: metrics.weightedPerformancePct >= 0,
          }}
          hint={`${formatCompactCurrency(metrics.totalCovered)} total covered · ${metrics.clientsWithBoth} AUA + AUM`}
          icon={Wallet}
          variant="brand"
        />
        <MetricCard
          label="Advisory sessions"
          value={`${metrics.advisorySessions.used} / ${metrics.advisorySessions.included}`}
          hint={`${metrics.advisorySessions.remaining} remaining this year`}
          icon={Calendar}
          variant="info"
        />
        <MetricCard
          label="Net flows QTD"
          value={formatCompactCurrency(metrics.netFlowQtd)}
          delta={{
            value: metrics.netFlowQtd >= 0 ? "Inflow" : "Outflow",
            positive: metrics.netFlowQtd >= 0,
          }}
          icon={Wallet}
          variant={metrics.netFlowQtd >= 0 ? "success" : "warning"}
        />
        <MetricCard
          label="Clients"
          value={String(metrics.clientCount)}
          hint={`${metrics.activeClients} active · ${metrics.onboarding} onboarding`}
          icon={Users}
        />
        <MetricCard
          label="Reviews due"
          value={String(metrics.reviewsDue + metrics.reviewsOverdue)}
          delta={
            metrics.reviewsOverdue > 0
              ? { value: `${metrics.reviewsOverdue} overdue`, positive: false }
              : undefined
          }
          hint="next 7 days"
          icon={AlertCircle}
          variant={metrics.reviewsOverdue > 0 ? "warning" : "default"}
        />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-5 lg:gap-6">
        <div className="min-w-0 lg:col-span-3">
          <BookCompositionPanel segments={bookComposition} />
        </div>
        <div className="min-w-0 lg:col-span-2">
          <UpcomingSection items={upcoming} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-5 xl:items-start xl:gap-6">
        <div className="min-w-0 xl:col-span-3">
          <GhanaRegionalMap spread={ghanaSpread} />
        </div>
        <div className="min-w-0 xl:col-span-2">
          <AgeDistributionPanel analytics={ageAnalytics} />
        </div>
      </div>

      <RecentActivitySection activity={activity} />
    </div>
  );
}
