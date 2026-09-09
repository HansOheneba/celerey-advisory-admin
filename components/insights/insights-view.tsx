import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  FileText,
  Scale,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { BookTrendChart } from "@/components/insights/book-trend-chart";
import { ComplianceQueue } from "@/components/insights/compliance-queue";
import { EmptyState } from "@/components/shared/empty-state";
import { IconTile } from "@/components/shared/icon-tile";
import { ListRow } from "@/components/shared/list-row";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionPanel } from "@/components/shared/section-panel";
import { StatGrid, StatItem } from "@/components/shared/stat-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { CapabilitySet } from "@/lib/auth/capabilities";
import { dashboardTheme } from "@/lib/dashboard-theme";
import type { BookMetrics } from "@/lib/demo/insights";
import { formatCompactCurrency, formatDate } from "@/lib/format";
import type {
  DemoClientRecord,
  DemoRecommendation,
  DemoReportRecord,
} from "@/lib/demo/types";
import type { AiSessionEntry } from "@/lib/demo/types";

type SegmentRow = {
  label: string;
  clients: number;
  aua: number;
  revenue: number;
  performancePct: number;
};

function buildSegmentRows(records: DemoClientRecord[]): SegmentRow[] {
  const bySegment = new Map<string, DemoClientRecord[]>();

  for (const record of records) {
    const existing = bySegment.get(record.segment);
    if (existing) {
      existing.push(record);
    } else {
      bySegment.set(record.segment, [record]);
    }
  }

  return [...bySegment.entries()]
    .map(([segment, group]) => {
      const aua = group.reduce((total, item) => total + item.client.aua, 0);

      return {
        label: segment.toUpperCase(),
        clients: group.length,
        aua,
        revenue: group.reduce(
          (total, item) => total + item.revenueQtdUsd,
          0,
        ),
        performancePct:
          aua > 0
            ? group.reduce(
                (total, item) =>
                  total + item.performanceYtdPct * item.client.aua,
                0,
              ) / aua
            : 0,
      };
    })
    .sort((a, b) => b.aua - a.aua);
}

type InsightsViewProps = {
  capabilities: CapabilitySet;
  metrics: BookMetrics;
  records: DemoClientRecord[];
  recommendations: DemoRecommendation[];
  reports: DemoReportRecord[];
  aiSessions: AiSessionEntry[];
};

export function InsightsView({
  capabilities,
  metrics,
  records,
  recommendations,
  reports,
  aiSessions,
}: InsightsViewProps) {
  const segments = buildSegmentRows(records);
  const pending = recommendations.filter(
    (recommendation) =>
      recommendation.status === "pending_compliance" ||
      recommendation.status === "proposed",
  );

  const topClients = [...records]
    .sort((a, b) => b.client.aua - a.client.aua)
    .slice(0, 10);

  return (
    <div className={dashboardTheme.pageContainer}>
      <PageHeader
        eyebrow="Insights"
        title="Analytics, compliance and reporting"
        description="Analytics for the book in your scope."
        icon={Scale}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Pending compliance"
          value={String(pending.length)}
          hint="awaiting decision"
          icon={ShieldAlert}
          variant={pending.length > 0 ? "warning" : "default"}
        />
        <MetricCard
          label="Reports generated"
          value={String(reports.length)}
          hint="in library"
          icon={FileText}
          variant="info"
        />
        <MetricCard
          label="Copilot sessions"
          value={String(aiSessions.length)}
          hint="book and client queries"
          icon={Sparkles}
          variant="ai"
        />
        <MetricCard
          label="Open escalations"
          value={String(metrics.escalations)}
          hint={`${metrics.riskBreaches} mandate breach${metrics.riskBreaches === 1 ? "" : "es"}`}
          icon={AlertTriangle}
          variant={metrics.escalations > 0 ? "warning" : "default"}
        />
      </div>

      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">
            Compliance
            {pending.length > 0 ? (
              <Badge variant="destructive" className="ml-1.5">
                {pending.length}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="ai">Copilot activity</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <SectionPanel
            title="AUA trend"
            description="Trailing six-month movement across the book."
            variant="brand"
          >
            <BookTrendChart
              currentAua={metrics.totalAua}
              growthPct={metrics.aumGrowthPct}
            />
          </SectionPanel>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionPanel
              title="By segment"
              description="Assets and revenue by segment."
              variant="muted"
            >
              <div className={dashboardTheme.tableShell}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Segment</TableHead>
                      <TableHead className="text-right">Clients</TableHead>
                      <TableHead className="text-right">AUA</TableHead>
                      <TableHead className="text-right">Revenue QTD</TableHead>
                      <TableHead className="text-right">TTM</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {segments.map((segment) => (
                      <TableRow key={segment.label}>
                        <TableCell className="font-medium">
                          {segment.label}
                        </TableCell>
                        <TableCell className="text-right">
                          {segment.clients}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCompactCurrency(segment.aua)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCompactCurrency(segment.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {segment.performancePct >= 0 ? "+" : ""}
                          {segment.performancePct.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </SectionPanel>

            <SectionPanel
              title="Book health"
              description={`Service and risk indicators across ${metrics.clientCount} relationships.`}
              variant="warning"
            >
              <StatGrid columns={2}>
                <StatItem label="Reviews due" value={metrics.reviewsDue} />
                <StatItem
                  label="Reviews overdue"
                  value={
                    <span
                      className={
                        metrics.reviewsOverdue > 0 ? "text-destructive" : undefined
                      }
                    >
                      {metrics.reviewsOverdue}
                    </span>
                  }
                />
                <StatItem label="Onboarding" value={metrics.onboarding} />
                <StatItem
                  label="Dormant relationships"
                  value={
                    <span
                      className={metrics.atRisk > 0 ? "text-destructive" : undefined}
                    >
                      {metrics.atRisk}
                    </span>
                  }
                />
                <StatItem
                  label="Mandate breaches"
                  value={
                    <span
                      className={
                        metrics.riskBreaches > 0 ? "text-destructive" : undefined
                      }
                    >
                      {metrics.riskBreaches}
                    </span>
                  }
                />
                <StatItem
                  label="Open escalations"
                  value={
                    <span
                      className={
                        metrics.escalations > 0 ? "text-destructive" : undefined
                      }
                    >
                      {metrics.escalations}
                    </span>
                  }
                />
              </StatGrid>
            </SectionPanel>
          </div>

          <SectionPanel title="Largest relationships" variant="muted">
            <div className={dashboardTheme.tableShell}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Relationship manager</TableHead>
                    <TableHead className="text-right">AUA</TableHead>
                    <TableHead className="text-right">TTM</TableHead>
                    <TableHead className="text-right">Revenue QTD</TableHead>
                    <TableHead className="text-right">Next review</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClients.map((record) => (
                    <TableRow key={record.client.id}>
                      <TableCell>
                        <Link
                          href={`/clients/${record.client.id}`}
                          className="font-medium hover:underline"
                        >
                          {record.client.firstName} {record.client.lastName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.client.advisorName}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCompactCurrency(record.client.aua)}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.performanceYtdPct >= 0 ? "+" : ""}
                        {record.performanceYtdPct.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCompactCurrency(record.revenueQtdUsd)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(record.client.nextReviewAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionPanel>
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceQueue
            recommendations={recommendations}
            canDecide={capabilities.capabilities.includes(
              "approve_recommendation",
            )}
          />
        </TabsContent>

        <TabsContent value="reports">
          <SectionPanel
            title="Report library"
            description="Every PDF generated from the portal, with who produced it."
          >
            {reports.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No reports yet"
                description="Produce a report from a client workspace to see it here."
              />
            ) : (
              <div className={dashboardTheme.tableShell}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Generated by</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Created</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {report.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {report.clientName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {report.generatedByName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={report.sentAt ? "secondary" : "outline"}
                          >
                            {report.sentAt ? "Sent" : "Internal"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatDate(report.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            render={
                              <Link
                                href={`/api/reports/${encodeURIComponent(report.id)}/download`}
                                target="_blank"
                                rel="noreferrer"
                              />
                            }
                          >
                            Open
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionPanel>
        </TabsContent>

        <TabsContent value="ai">
          <SectionPanel
            title="Copilot activity log"
            description="Each query, the data scopes read, and who asked."
            variant="ai"
          >
            {aiSessions.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="No copilot activity"
                description="No Copilot sessions yet. Queries from the Copilot page log here."
                variant="ai"
              />
            ) : (
              <div className="divide-y divide-border/50">
                {aiSessions.map((entry) => (
                  <ListRow
                    key={entry.id}
                    leading={<IconTile icon={Sparkles} variant="ai" size="sm" />}
                    title={
                      <>
                        <span className="text-sm font-medium">{entry.prompt}</span>
                        <Badge variant="outline">{entry.mode}</Badge>
                      </>
                    }
                    meta={`${entry.userName} (${entry.role}) · ${formatDate(entry.createdAt)} · scopes: ${entry.contextScopes.join(", ")}`}
                  />
                ))}
              </div>
            )}
          </SectionPanel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
