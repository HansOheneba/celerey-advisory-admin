import Link from "next/link";
import {
  AlertCircle,
  DollarSign,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { BookCompositionPanel } from "@/components/overview/book-composition-panel";
import { GeographicSpreadCompact } from "@/components/overview/geographic-spread-compact";
import { NeedsAttentionSection } from "@/components/overview/needs-attention-section";
import { RecentActivitySection } from "@/components/overview/recent-activity-section";
import { UpcomingSection } from "@/components/overview/upcoming-section";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatCompactCurrency } from "@/lib/format";
import { type BookMetrics } from "@/lib/demo/insights";
import { computeGeographicSpread } from "@/lib/overview/book-analytics";
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
  const attentionRows = buildAttentionRows(alerts);
  const bookComposition = computeBookComposition(records);
  const geographicSpread = computeGeographicSpread(records);
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
        totalCount={alerts.length}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Total AUA"
          value={formatCompactCurrency(metrics.totalAua)}
          delta={{
            value: `${metrics.aumGrowthPct >= 0 ? "+" : ""}${metrics.aumGrowthPct}%`,
            positive: metrics.aumGrowthPct >= 0,
          }}
          hint="trailing 12 months"
          icon={DollarSign}
        />
        <MetricCard
          label="Revenue QTD"
          value={formatCompactCurrency(metrics.revenueQtd)}
          hint={`${metrics.clientCount} relationships`}
          icon={TrendingUp}
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
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BookCompositionPanel segments={bookComposition} />
        <UpcomingSection items={upcoming} />
      </div>

      <GeographicSpreadCompact spread={geographicSpread} />

      <RecentActivitySection activity={activity} />
    </div>
  );
}
