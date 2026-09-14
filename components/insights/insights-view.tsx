import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  FileText,
  Scale,
  ShieldAlert,
} from "lucide-react";

import { AgeDistributionPanel } from "@/components/insights/age-distribution-panel";
import { AuaAumPanel } from "@/components/insights/aua-aum-panel";
import { BookTrendChart } from "@/components/insights/book-trend-chart";
import { ComplianceQueue } from "@/components/insights/compliance-queue";
import { GlobalResidencyMap } from "@/components/insights/global-residency-map";
import { EmptyState } from "@/components/shared/empty-state";
import { IconTile } from "@/components/shared/icon-tile";
import { ListRow } from "@/components/shared/list-row";
import { BookAssetsCard } from "@/components/shared/book-assets-card";
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
import { hasCapability, type CapabilitySet } from "@/lib/auth/capabilities";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { insightsPageDescription } from "@/lib/overview/book-scope-copy";
import type { BookMetrics } from "@/lib/demo/insights";
import { AssetRelationshipBadge } from "@/components/clients/asset-relationship-badge";
import { formatCompactCurrency, formatDate } from "@/lib/format";
import {
  computeAgeAnalytics,
  computeResidencySpread,
} from "@/lib/overview/book-analytics";
import type {
  DemoClientRecord,
  DemoRecommendation,
  DemoReportRecord,
} from "@/lib/demo/types";
import type { AiSessionEntry } from "@/lib/demo/types";
import {
  CLIENT_SEGMENT_LABELS,
  type ClientSegment,
} from "@/types/client";

type SegmentRow = {
  label: string;
  clients: number;
  aua: number;
  aum: number;
  revenue: number;
  performancePct: number;
};

function buildSegmentRows(records: DemoClientRecord[]): SegmentRow[] {
  const bySegment = new Map<ClientSegment, DemoClientRecord[]>();

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
      const aum = group.reduce((total, item) => total + item.client.aum, 0);

      return {
        label: CLIENT_SEGMENT_LABELS[segment],
        clients: group.length,
        aua,
        aum,
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
  const ageAnalytics = computeAgeAnalytics(records);
  const residencySpread = computeResidencySpread(records);
  const pending = recommendations.filter(
    (recommendation) =>
      recommendation.status === "pending_compliance" ||
      recommendation.status === "proposed",
  );

  const topClients = [...records]
    .sort((a, b) => b.client.aua - a.client.aua)
    .slice(0, 10);

  const canViewFirmAnalytics = hasCapability(
    capabilities,
    "view_firm_analytics",
  );
  const isOwnBook = capabilities.scope === "own_book";
  return (
    <div className={dashboardTheme.pageContainer}>
      <PageHeader
        eyebrow="Insights"
        title="Analytics and compliance"
        description={insightsPageDescription(capabilities.scope)}
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
        {canViewFirmAnalytics ? (
          <MetricCard
            label="Celerey Copilot sessions"
            value={String(aiSessions.length)}
            hint="book and client"
            symbol="celerey-ai"
            variant="ai"
          />
        ) : null}
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
          {canViewFirmAnalytics ? (
            <TabsTrigger value="ai">Celerey Copilot activity</TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <BookAssetsCard
              className="lg:col-span-2"
              totalAua={metrics.totalAua}
              totalAum={metrics.totalAum}
              scope={capabilities.scope}
              performancePct={metrics.weightedPerformancePct}
            />
            <MetricCard
              label="Net flows QTD"
              value={formatCompactCurrency(metrics.netFlowQtd)}
              delta={{
                value: metrics.netFlowQtd >= 0 ? "Inflow" : "Outflow",
                positive: metrics.netFlowQtd >= 0,
              }}
              hint={`${formatCompactCurrency(metrics.revenueQtd)} revenue QTD`}
            />
          </div>

          <AuaAumPanel
            totalAua={metrics.totalAua}
            totalAum={metrics.totalAum}
            records={records}
            scope={capabilities.scope}
          />

          <SectionPanel
            title="AUA and AUM trend"
            description="Six months of AUA and AUM. AUM counts toward AUA."
          >
            <BookTrendChart
              currentAua={metrics.totalAua}
              currentAum={metrics.totalAum}
              growthPct={metrics.weightedPerformancePct}
            />
          </SectionPanel>

          <div className="grid gap-4 lg:grid-cols-2">
            <AgeDistributionPanel analytics={ageAnalytics} />

            <SectionPanel
              title="By segment"
              description="Revenue and assets by client segment."
              variant="muted"
            >
              <div className={dashboardTheme.tableShell}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Segment</TableHead>
                      <TableHead className="text-right">Clients</TableHead>
                      <TableHead className="text-right">AUA</TableHead>
                      <TableHead className="text-right">AUM</TableHead>
                      <TableHead className="text-right">Revenue QTD</TableHead>
                      <TableHead className="text-right">Past 12 mo</TableHead>
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
                          {formatCompactCurrency(segment.aum)}
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
              description={`Reviews, onboarding, breaches, and dormant clients across ${metrics.clientCount} relationships.`}
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

          <GlobalResidencyMap spread={residencySpread} />

          <SectionPanel title="Largest relationships" variant="muted">
            <div className={dashboardTheme.tableShell}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    {!isOwnBook ? (
                      <TableHead>Relationship manager</TableHead>
                    ) : null}
                    <TableHead className="text-right">AUA</TableHead>
                    <TableHead className="text-right">AUM</TableHead>
                    <TableHead className="text-right">Past 12 mo</TableHead>
                    <TableHead className="text-right">Revenue QTD</TableHead>
                    <TableHead className="text-right">Next review</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClients.map((record) => (
                    <TableRow key={record.client.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            href={`/clients/${record.client.id}`}
                            className="font-medium hover:underline"
                          >
                            {record.client.firstName} {record.client.lastName}
                          </Link>
                          <AssetRelationshipBadge
                            aua={record.client.aua}
                            aum={record.client.aum}
                            compact
                          />
                        </div>
                      </TableCell>
                      {!isOwnBook ? (
                        <TableCell className="text-muted-foreground">
                          {record.client.advisorName}
                        </TableCell>
                      ) : null}
                      <TableCell className="text-right">
                        {formatCompactCurrency(record.client.aua)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCompactCurrency(record.client.aum)}
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
            description="Reports created in the portal."
          >
            {reports.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No reports yet"
                description="Generate a report from a client workspace."
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

        {canViewFirmAnalytics ? (
          <TabsContent value="ai">
            <SectionPanel
              title="Celerey Copilot activity log"
              description="Who asked, what they queried, and which scopes were read."
              variant="ai"
            >
              {aiSessions.length === 0 ? (
                <EmptyState
                  icon={Bot}
                  title="No Celerey Copilot activity"
                  description="Queries from the Celerey Copilot page show up here."
                  variant="ai"
                />
              ) : (
                <div className="divide-y divide-border">
                  {aiSessions.map((entry) => (
                    <ListRow
                      key={entry.id}
                      leading={
                        <IconTile symbol="celerey-ai" variant="ai" size="sm" />
                      }
                      title={
                        <>
                          <span className="text-sm font-medium">
                            {entry.prompt}
                          </span>
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
        ) : null}
      </Tabs>
    </div>
  );
}
