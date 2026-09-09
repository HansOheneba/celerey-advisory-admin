"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_PRIMARY } from "@/lib/chart-colors";
import { formatCompactCurrency } from "@/lib/format";

type BookTrendChartProps = {
  currentAua: number;
  growthPct: number;
};

function buildTrendData(currentAua: number, growthPct: number) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const factor = 1 + growthPct / 100;

  return months.map((month, index) => {
    const progress = index / (months.length - 1);
    const startAua = currentAua / factor;
    const aua = Math.round(startAua + (currentAua - startAua) * progress);

    return { month, aua };
  });
}

export function BookTrendChart({ currentAua, growthPct }: BookTrendChartProps) {
  const data = buildTrendData(currentAua, growthPct);

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="bookTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.15} />
              <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={56}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(value: number) => formatCompactCurrency(value)}
          />
          <Tooltip
            formatter={(value) => formatCompactCurrency(Number(value))}
            labelClassName="text-xs"
            contentStyle={{
              borderRadius: "0.625rem",
              border: "1px solid var(--border)",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="aua"
            stroke={CHART_PRIMARY}
            strokeWidth={2}
            fill="url(#bookTrendFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
