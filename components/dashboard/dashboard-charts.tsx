"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardSummary } from "@/types/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatCompactCurrency, titleCase } from "@/lib/format";

const riskColors = ["#1e3a5f", "#151339", "#8c80f8", "#7eb8e8"];

type DashboardChartsProps = {
  summary: DashboardSummary;
};

export function DashboardCharts({ summary }: DashboardChartsProps) {
  const auaData = summary.auaByRisk.map((item) => ({
    name: titleCase(item.riskLevel),
    value: item.value,
  }));

  const statusData = summary.clientsByStatus.map((item) => ({
    name: titleCase(item.status),
    count: item.count,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className={dashboardTheme.card}>
        <CardHeader>
          <p className={dashboardTheme.sectionLabel}>Allocation</p>
          <CardTitle className="text-base font-semibold">
            AUA by risk profile
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={auaData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {auaData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={riskColors[index % riskColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  formatCompactCurrency(typeof value === "number" ? value : 0)
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className={dashboardTheme.card}>
        <CardHeader>
          <p className={dashboardTheme.sectionLabel}>Book health</p>
          <CardTitle className="text-base font-semibold">
            Clients by status
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#151339" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
