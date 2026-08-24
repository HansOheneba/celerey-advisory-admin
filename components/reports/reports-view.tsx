import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className={dashboardTheme.page}>
      <section className="space-y-0.5">
        <p className={dashboardTheme.sectionLabel}>Insights</p>
        <h2 className={dashboardTheme.pageTitle}>Reports</h2>
        <p className={dashboardTheme.pageDescription}>
          {advisors
            ? "Firm-wide book performance, client health, and advisor workload."
            : "Book performance and client health for your assigned clients."}
        </p>
      </section>

      <Card className={dashboardTheme.card}>
        <CardHeader>
          <p className={dashboardTheme.sectionLabel}>Book performance</p>
          <CardTitle className="text-base font-semibold">Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Total clients", value: String(summary.totalClients) },
            { label: "Active clients", value: String(summary.activeClients) },
            {
              label: "Total AUA",
              value: formatCompactCurrency(summary.totalAua),
            },
            {
              label: "Average AUA per client",
              value: formatCompactCurrency(summary.averageAua),
            },
            {
              label: "Reviews due this week",
              value: String(summary.reviewsDueThisWeek),
            },
            {
              label: "Onboarding in progress",
              value: String(summary.onboardingCount),
            },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-lg font-semibold tracking-tight">
                {item.value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className={dashboardTheme.card}>
          <CardHeader>
            <p className={dashboardTheme.sectionLabel}>Book health</p>
            <CardTitle className="text-base font-semibold">
              Clients by status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
          </CardContent>
        </Card>

        <Card className={dashboardTheme.card}>
          <CardHeader>
            <p className={dashboardTheme.sectionLabel}>Allocation</p>
            <CardTitle className="text-base font-semibold">
              AUA by risk profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
          </CardContent>
        </Card>
      </div>

      {advisors ? (
        <Card className={dashboardTheme.card}>
          <CardHeader>
            <p className={dashboardTheme.sectionLabel}>Team</p>
            <CardTitle className="text-base font-semibold">
              Advisor workload
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
