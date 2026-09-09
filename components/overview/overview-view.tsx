import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  DollarSign,
  Lightbulb,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { IconTile } from "@/components/shared/icon-tile";
import { ListRow } from "@/components/shared/list-row";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionPanel } from "@/components/shared/section-panel";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatCompactCurrency, formatDate, getInitials } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  priorityClients,
  type BookMetrics,
} from "@/lib/demo/insights";
import {
  CLIENT_SEGMENT_LABELS,
  OPPORTUNITY_LABELS,
  type DemoAlert,
  type DemoClientRecord,
  type DemoOpportunity,
} from "@/lib/demo/types";
import type { ClientActivity } from "@/types/client";
import type { CapabilitySet } from "@/lib/auth/capabilities";
import { cn } from "@/lib/utils";

const SCOPE_DESCRIPTIONS = {
  own_book: "your book",
  team: "your team's book",
  firm: "the firm's book",
} as const;

const SEGMENT_RING: Record<string, string> = {
  uhnw: "ring-emerald-500/40",
  hnw: "ring-primary/40",
  affluent: "ring-blue-500/40",
  emerging: "ring-amber-500/40",
};

type OverviewViewProps = {
  capabilities: CapabilitySet;
  metrics: BookMetrics;
  records: DemoClientRecord[];
  alerts: DemoAlert[];
  opportunities: DemoOpportunity[];
  activity: ClientActivity[];
};

export function OverviewView({
  capabilities,
  metrics,
  records,
  alerts,
  opportunities,
  activity,
}: OverviewViewProps) {
  const priority = priorityClients(records, alerts);
  const attention = alerts.slice(0, 8);
  const opportunityGroups = groupOpportunities(opportunities);
  const attentionCount = alerts.length;

  return (
    <div className={dashboardTheme.pageContainer}>
      <PageHeader
        eyebrow={capabilities.label}
        title="Overview"
        description={
          attentionCount > 0
            ? `${attentionCount} item${attentionCount === 1 ? "" : "s"} need attention across ${SCOPE_DESCRIPTIONS[capabilities.scope]}.`
            : `No open alerts across ${SCOPE_DESCRIPTIONS[capabilities.scope]}.`
        }
        icon={TrendingUp}
        actions={
          <Button variant="outline" render={<Link href="/clients" />}>
            View all clients
          </Button>
        }
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
          variant="accent"
        />
        <MetricCard
          label="Revenue QTD"
          value={formatCompactCurrency(metrics.revenueQtd)}
          hint={`across ${metrics.clientCount} relationships`}
          icon={TrendingUp}
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
          variant="brand"
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

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionPanel
          title="Priority clients"
          description="Ranked by open issues and relationship size."
          variant="brand"
        >
          {priority.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No priority clients"
              description="No clients rank high on open issues right now."
            />
          ) : (
            <div className="divide-y divide-border/50">
              {priority.map(({ record, reasons }) => (
                <ListRow
                  key={record.client.id}
                  href={`/clients/${record.client.id}`}
                  leading={
                    <Avatar
                      className={cn(
                        "size-9 ring-2 ring-offset-2 ring-offset-background",
                        SEGMENT_RING[record.segment] ?? "ring-primary/30",
                      )}
                    >
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {getInitials(
                          record.client.firstName,
                          record.client.lastName,
                        )}
                      </AvatarFallback>
                    </Avatar>
                  }
                  title={
                    <>
                      <span className="text-sm font-medium">
                        {record.client.firstName} {record.client.lastName}
                      </span>
                      <Badge variant="secondary">
                        {CLIENT_SEGMENT_LABELS[record.segment]}
                      </Badge>
                    </>
                  }
                  meta={`${formatCompactCurrency(record.client.aua)} · ${reasons.slice(0, 2).join(" · ")}${reasons.length > 2 ? ` +${reasons.length - 2} more` : ""}`}
                />
              ))}
            </div>
          )}
        </SectionPanel>

        <SectionPanel
          title="Alerts & attention"
          description={`${metrics.riskBreaches} risk breach${metrics.riskBreaches === 1 ? "" : "es"} · ${metrics.reviewsOverdue} review${metrics.reviewsOverdue === 1 ? "" : "s"} overdue · ${metrics.escalations} escalation${metrics.escalations === 1 ? "" : "s"}`}
          variant="warning"
        >
          {attention.length === 0 ? (
            <EmptyState
              icon={AlertCircle}
              title="No open alerts"
              description="Nothing in the queue needs your attention."
              variant="success"
            />
          ) : (
            <div className="divide-y divide-border/50">
              {attention.map((alert) => (
                <ListRow
                  key={alert.id}
                  href={
                    alert.clientId
                      ? `/clients/${alert.clientId}${alert.workspaceTab ? `?tab=${alert.workspaceTab}` : ""}`
                      : "/clients"
                  }
                  leading={
                    <SeverityBadge severity={alert.severity} />
                  }
                  title={<span className="text-sm font-medium">{alert.title}</span>}
                  description={
                    <>
                      {alert.clientName ? `${alert.clientName} — ` : ""}
                      {alert.detail}
                    </>
                  }
                />
              ))}
            </div>
          )}
        </SectionPanel>

        <SectionPanel
          title="Opportunities"
          description={`${formatCompactCurrency(
            opportunities.reduce(
              (total, opportunity) => total + opportunity.valueUsd,
              0,
            ),
          )} identified across ${opportunities.length} items.`}
          variant="success"
        >
          {opportunityGroups.length === 0 ? (
            <EmptyState
              icon={Lightbulb}
              title="No open opportunities"
              description="No open opportunities. Check Insights after the next portfolio update."
              variant="success"
            />
          ) : (
            <div className="divide-y divide-border/50">
              {opportunityGroups.map((group) => (
                <ListRow
                  key={group.kind}
                  leading={<IconTile icon={Lightbulb} variant="success" size="sm" />}
                  title={
                    <>
                      <span className="text-sm font-medium">
                        {OPPORTUNITY_LABELS[group.kind]}
                      </span>
                      <Badge variant="secondary">{group.count}</Badge>
                    </>
                  }
                  meta={`${formatCompactCurrency(group.valueUsd)} across ${group.clientNames.slice(0, 2).join(", ")}${group.count > 2 ? ` +${group.count - 2} more` : ""}`}
                />
              ))}
            </div>
          )}
        </SectionPanel>
      </div>

      <SectionPanel
        title="Recent activity"
        description="The latest movements across your relationships."
        className="border-l-[3px] border-l-primary"
      >
        {activity.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No recent activity"
            description="No recent movements. Activity logs here when clients trade, message, or review."
          />
        ) : (
          <ul className="divide-y divide-border/50">
            {activity.map((entry) => (
              <li key={entry.id}>
                <ListRow
                  title={<span className="text-sm">{entry.summary}</span>}
                  meta={`${entry.clientName} · ${formatDate(entry.occurredAt)}`}
                  trailing={
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/clients/${entry.clientId}`} />}
                    >
                      Open
                      <ArrowUpRight />
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>
    </div>
  );
}

type OpportunityGroup = {
  kind: DemoOpportunity["kind"];
  count: number;
  valueUsd: number;
  clientNames: string[];
};

function groupOpportunities(
  opportunities: DemoOpportunity[],
): OpportunityGroup[] {
  const groups = new Map<DemoOpportunity["kind"], OpportunityGroup>();

  for (const opportunity of opportunities) {
    const existing = groups.get(opportunity.kind);

    if (existing) {
      existing.count += 1;
      existing.valueUsd += opportunity.valueUsd;
      existing.clientNames.push(opportunity.clientName);
    } else {
      groups.set(opportunity.kind, {
        kind: opportunity.kind,
        count: 1,
        valueUsd: opportunity.valueUsd,
        clientNames: [opportunity.clientName],
      });
    }
  }

  return [...groups.values()].sort((a, b) => b.valueUsd - a.valueUsd);
}
