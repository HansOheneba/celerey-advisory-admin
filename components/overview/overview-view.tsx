import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { AgeDistributionPanel } from "@/components/insights/age-distribution-panel";
import { BookCompositionPanel } from "@/components/overview/book-composition-panel";
import { GhanaRegionalMap } from "@/components/overview/ghana-regional-map";
import { NeedsAttentionSection } from "@/components/overview/needs-attention-section";
import { RecentActivitySection } from "@/components/overview/recent-activity-section";
import { UpcomingSection } from "@/components/overview/upcoming-section";
import { BookAssetsCard } from "@/components/shared/book-assets-card";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
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

      <div className="space-y-3">
        <BookAssetsCard
          totalAua={metrics.totalAua}
          totalAum={metrics.totalAum}
          scope={capabilities.scope}
          performancePct={metrics.weightedPerformancePct}
        />
        <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard
            compact
            label="Advisory sessions"
            value={String(metrics.advisorySessions.used)}
          />
          <MetricCard
            compact
            label="Net flows QTD"
            value={formatCompactCurrency(metrics.netFlowQtd)}
            delta={{
              value: metrics.netFlowQtd >= 0 ? "Inflow" : "Outflow",
              positive: metrics.netFlowQtd >= 0,
            }}
            variant={metrics.netFlowQtd >= 0 ? "success" : "warning"}
          />
          <MetricCard
            compact
            label="Clients"
            value={String(metrics.clientCount)}
            hint={`${metrics.activeClients} active · ${metrics.onboarding} onboarding`}
          />
          <MetricCard
            compact
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
      </div>

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
