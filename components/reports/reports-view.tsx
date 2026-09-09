import { BarChart3, Users } from "lucide-react";

import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionPanel } from "@/components/shared/section-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatCompactCurrency, titleCase } from "@/lib/format";
import type { Advisor } from "@/types/advisor";
import type { DashboardSummary } from "@/types/client";

type ReportsViewProps = {
  summary: DashboardSummary;
  advisors: Advisor[] | null;
};

function percentOf(value: number, total: number) {
  if (total <= 0) {
    return "0%";
  }
  return `${Math.round((value / total) * 100)}%`;
}

export function ReportsView({ summary, advisors }: ReportsViewProps) {
  return (
    <div className={dashboardTheme.pageContainer}>
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        description={
          advisors
            ? "Firm-wide book performance, client health, and advisor workload."
            : "Book performance and client health for your assigned clients."
        }
        icon={BarChart3}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Total clients"
          value={String(summary.totalClients)}
          hint={`${summary.activeClients} active`}
          icon={Users}
          variant="brand"
        />
        <MetricCard
          label="Total AUA"
          value={formatCompactCurrency(summary.totalAua)}
          hint={`${formatCompactCurrency(summary.averageAua)} average`}
          variant="accent"
        />
        <MetricCard
          label="Reviews due"
          value={String(summary.reviewsDueThisWeek)}
          hint={`${summary.onboardingCount} onboarding`}
          variant={summary.reviewsDueThisWeek > 0 ? "warning" : "info"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionPanel
          title="Clients by status"
          description="Book health breakdown."
          variant="brand"
        >
          <div className={dashboardTheme.tableShell}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Clients</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.clientsByStatus.map((row) => (
                  <TableRow key={row.status}>
                    <TableCell>{titleCase(row.status)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.count}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {percentOf(row.count, summary.totalClients)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionPanel>

        <SectionPanel
          title="AUA by risk profile"
          description="Allocation across risk bands."
          variant="info"
        >
          <div className={dashboardTheme.tableShell}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk profile</TableHead>
                  <TableHead className="text-right">AUA</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.auaByRisk.map((row) => (
                  <TableRow key={row.riskLevel}>
                    <TableCell>{titleCase(row.riskLevel)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCompactCurrency(row.value)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {percentOf(row.value, summary.totalAua)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionPanel>
      </div>

      {advisors ? (
        <SectionPanel
          title="Advisor workload"
          description="Client count and share of book by advisor."
          variant="muted"
        >
          <div className={dashboardTheme.tableShell}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Advisor</TableHead>
                  <TableHead className="text-right">Clients</TableHead>
                  <TableHead className="text-right">Share of book</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advisors.map((advisor) => (
                  <TableRow key={advisor.id}>
                    <TableCell>{advisor.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {advisor.clientCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {percentOf(advisor.clientCount, summary.totalClients)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionPanel>
      ) : null}
    </div>
  );
}
