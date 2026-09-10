"use client";

import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_PALETTE, CHART_PRIMARY } from "@/lib/chart-colors";
import { formatCompactCurrency } from "@/lib/format";

type BookTrendChartProps = {
  currentAua: number;
  currentAum: number;
  growthPct: number;
};

function buildTrendData(
  currentAua: number,
  currentAum: number,
  growthPct: number,
) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const factor = 1 + growthPct / 100;
  const currentTotal = currentAua + currentAum;
  const startTotal = currentTotal / factor;
  const startAua =
    currentTotal > 0 ? (currentAua / currentTotal) * startTotal : 0;
  const startAum =
    currentTotal > 0 ? (currentAum / currentTotal) * startTotal : 0;

  return months.map((month, index) => {
    const progress = index / (months.length - 1);

    return {
      month,
      aua: Math.round(startAua + (currentAua - startAua) * progress),
      aum: Math.round(startAum + (currentAum - startAum) * progress),
    };
  });
}

export function BookTrendChart({
  currentAua,
  currentAum,
  growthPct,
}: BookTrendChartProps) {
  const data = buildTrendData(currentAua, currentAum, growthPct);

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="bookAumFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.18} />
              <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="bookAuaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_PALETTE[1]} stopOpacity={0.18} />
              <stop offset="100%" stopColor={CHART_PALETTE[1]} stopOpacity={0} />
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
            formatter={(value, name) => [
              formatCompactCurrency(Number(value)),
              name === "aum" ? "AUM" : "AUA",
            ]}
            labelClassName="text-xs"
            contentStyle={{
              borderRadius: "0.625rem",
              border: "1px solid var(--border)",
              fontSize: "12px",
            }}
          />
          <Legend
            verticalAlign="top"
            height={28}
            formatter={(value) => (value === "aum" ? "AUM" : "AUA")}
            iconType="circle"
            wrapperStyle={{ fontSize: "11px" }}
          />
          <Area
            type="monotone"
            dataKey="aum"
            stackId="book"
            stroke={CHART_PRIMARY}
            strokeWidth={2}
            fill="url(#bookAumFill)"
          />
          <Area
            type="monotone"
            dataKey="aua"
            stackId="book"
            stroke={CHART_PALETTE[1]}
            strokeWidth={2}
            fill="url(#bookAuaFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
