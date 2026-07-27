"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Info, TrendingDown, TrendingUp } from "lucide-react";

const INCOME_COLOR = "#1e3a5f";
const EXPENSES_COLOR = "#7eb8e8";
const SURPLUS_COLOR = "#10b981";
const DEFICIT_COLOR = "#f43f5e";

type Currency = "USD" | "GHS" | "GBP";

type MoneyRow = {
  amount: number;
  isRecurring?: boolean;
  recurringType?: string;
  startDate?: string;
  endDate?: string | null;
};

type CashFlowPoint = {
  month: string;
  income: number;
  expenses: number;
  surplus?: number;
};

type EnrichedPoint = CashFlowPoint & {
  isProjected?: boolean;
  label: string;
};

type ClientCashFlowChartProps = {
  history: CashFlowPoint[];
  incomeRows: MoneyRow[];
  expenseCategories: MoneyRow[];
  currency: Currency;
  className?: string;
};

function addMonths(base: Date, offset: number): string {
  const d = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function toLabel(isoMonth: string): string {
  return new Date(`${isoMonth}-01`).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function nextIsoMonth(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  return addMonths(new Date(year, mon - 1, 1), 1);
}

function projectMonthlyAmount(rows: MoneyRow[], isoMonth: string): number {
  return rows
    .filter((row) => {
      const isOngoing =
        row.recurringType !== "one-time" && row.isRecurring !== false;

      if (!row.startDate) {
        return isOngoing;
      }

      const startMonth = row.startDate.slice(0, 7);
      if (isoMonth < startMonth) {
        return false;
      }

      if (!row.isRecurring || row.recurringType === "one-time") {
        return startMonth === isoMonth;
      }

      if (row.endDate && isoMonth > row.endDate.slice(0, 7)) {
        return false;
      }

      return true;
    })
    .reduce((sum, row) => sum + row.amount, 0);
}

function projectHistoricalMonthlyAmount(
  rows: MoneyRow[],
  isoMonth: string,
): number {
  return rows
    .filter((row) => {
      const isOngoing =
        row.recurringType !== "one-time" && row.isRecurring !== false;

      if (!row.startDate) {
        return isOngoing;
      }

      const startMonth = row.startDate.slice(0, 7);
      if (isoMonth < startMonth) {
        return false;
      }

      if (!row.isRecurring || row.recurringType === "one-time") {
        return startMonth === isoMonth;
      }

      if (row.endDate && isoMonth > row.endDate.slice(0, 7)) {
        return false;
      }

      return true;
    })
    .reduce((sum, row) => sum + row.amount, 0);
}

function CashFlowTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    dataKey?: string | number | ((obj: unknown) => unknown);
    value?: unknown;
  }>;
  label?: string;
  currency: Currency;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const readValue = (key: string) => {
    const entry = payload.find(
      (point) => point.dataKey === key && point.value != null,
    );
    return typeof entry?.value === "number" ? entry.value : undefined;
  };

  const incomeValue = readValue("income") ?? readValue("projIncome");
  const expensesValue = readValue("expenses") ?? readValue("projExpenses");
  const isProjected =
    readValue("projIncome") != null && readValue("income") == null;

  const surplus =
    incomeValue != null && expensesValue != null
      ? incomeValue - expensesValue
      : null;

  return (
    <div className="min-w-40 space-y-1.5 rounded-lg border bg-background px-3 py-2.5 text-xs shadow-md">
      <p className="mb-1 font-semibold text-foreground">
        {label}
        {isProjected ? (
          <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
            (projected)
          </span>
        ) : null}
      </p>
      {incomeValue != null ? (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: INCOME_COLOR }}
            />
            <span className="text-muted-foreground">Income</span>
          </div>
          <span className="font-medium">
            {formatCurrency(incomeValue, currency)}
          </span>
        </div>
      ) : null}
      {expensesValue != null ? (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: EXPENSES_COLOR }}
            />
            <span className="text-muted-foreground">Expenses</span>
          </div>
          <span className="font-medium">
            {formatCurrency(expensesValue, currency)}
          </span>
        </div>
      ) : null}
      {surplus != null ? (
        <div className="mt-1 flex items-center justify-between gap-4 border-t pt-1.5">
          <span className="text-muted-foreground">
            {surplus >= 0 ? "Surplus" : "Deficit"}
          </span>
          <span
            className="font-semibold"
            style={{ color: surplus >= 0 ? SURPLUS_COLOR : DEFICIT_COLOR }}
          >
            {surplus >= 0 ? "+" : ""}
            {formatCurrency(surplus, currency)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function SnapshotBanner({
  monthlyIncome,
  monthlyExpenses,
  currency,
}: {
  monthlyIncome: number;
  monthlyExpenses: number;
  currency: Currency;
}) {
  const surplus = monthlyIncome - monthlyExpenses;
  const isPositive = surplus >= 0;
  const annualSavings = surplus * 12;
  const savingsRate =
    monthlyIncome > 0
      ? Math.round((Math.max(surplus, 0) / monthlyIncome) * 100)
      : 0;
  const SurplusIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="mb-3 grid grid-cols-3 gap-2">
      <div
        className="flex flex-col gap-0.5 rounded-lg p-2.5"
        style={{
          background: isPositive
            ? "rgba(16,185,129,0.07)"
            : "rgba(244,63,94,0.07)",
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Monthly {isPositive ? "surplus" : "deficit"}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <SurplusIcon
            className="size-3.5 shrink-0"
            style={{ color: isPositive ? SURPLUS_COLOR : DEFICIT_COLOR }}
          />
          <p
            className="text-lg font-semibold tabular-nums"
            style={{ color: isPositive ? SURPLUS_COLOR : DEFICIT_COLOR }}
          >
            {isPositive ? "+" : ""}
            {formatCurrency(surplus, currency)}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {savingsRate}% savings rate
        </p>
      </div>

      <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          12-month projection
        </p>
        <p className="mt-0.5 text-lg font-semibold tabular-nums">
          {formatCurrency(Math.max(annualSavings, 0), currency)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {isPositive ? "if this cadence holds" : "review spending pressure"}
        </p>
      </div>

      <div className="flex flex-col gap-0.5 rounded-lg bg-muted/40 p-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Trend data
        </p>
        <div className="mt-0.5 flex items-start gap-1.5">
          <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Chart shows projected flow. Actuals build as months close.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ClientCashFlowChart({
  history,
  incomeRows,
  expenseCategories,
  currency,
  className,
}: ClientCashFlowChartProps) {
  const isNewUser = history.length === 0;
  const [timeRange, setTimeRange] = React.useState("this-year");

  const projectedIncome = React.useMemo(
    () => projectMonthlyAmount(incomeRows, addMonths(new Date(), 0)),
    [incomeRows],
  );
  const projectedExpenses = React.useMemo(
    () => projectMonthlyAmount(expenseCategories, addMonths(new Date(), 0)),
    [expenseCategories],
  );

  const mergedData = React.useMemo<EnrichedPoint[]>(() => {
    const today = new Date();
    const currentMonth = addMonths(today, 0);
    const minHistoricalMonth = addMonths(
      new Date(today.getFullYear(), today.getMonth() - 24, 1),
      0,
    );

    const allStartMonths = [
      ...incomeRows
        .filter((row) => row.startDate && row.startDate.slice(0, 7) <= currentMonth)
        .map((row) => row.startDate!.slice(0, 7)),
      ...expenseCategories
        .filter((row) => row.startDate && row.startDate.slice(0, 7) <= currentMonth)
        .map((row) => row.startDate!.slice(0, 7)),
    ];

    const currentYearStart = `${today.getFullYear()}-01`;
    const earliestFromStarts =
      allStartMonths.length > 0
        ? allStartMonths.reduce((a, b) => (a < b ? a : b))
        : currentYearStart;
    const earliestHistoricalMonth =
      earliestFromStarts > minHistoricalMonth
        ? earliestFromStarts
        : minHistoricalMonth;

    const actualByMonth = new Map(history.map((point) => [point.month, point]));
    const points: EnrichedPoint[] = [];

    let month = earliestHistoricalMonth;
    while (month <= currentMonth) {
      const actual = actualByMonth.get(month);
      const synthIncome = projectHistoricalMonthlyAmount(incomeRows, month);
      const synthExpenses = projectHistoricalMonthlyAmount(
        expenseCategories,
        month,
      );

      const finalIncome =
        actual?.income != null
          ? actual.income
          : synthIncome > 0
            ? synthIncome
            : 0;
      const finalExpenses =
        actual?.expenses != null
          ? actual.expenses
          : synthExpenses > 0
            ? synthExpenses
            : 0;

      if (actual || finalIncome > 0 || finalExpenses > 0) {
        points.push({
          month,
          income: finalIncome,
          expenses: finalExpenses,
          surplus:
            actual?.income != null
              ? (actual.surplus ?? actual.income - actual.expenses)
              : undefined,
          isProjected: false,
          label: toLabel(month),
        });
      }

      month = nextIsoMonth(month);
    }

    for (let i = 1; i <= 12; i += 1) {
      const futureMonth = addMonths(today, i);
      if (!actualByMonth.has(futureMonth)) {
        points.push({
          month: futureMonth,
          income: projectMonthlyAmount(incomeRows, futureMonth),
          expenses: projectMonthlyAmount(expenseCategories, futureMonth),
          isProjected: true,
          label: toLabel(futureMonth),
        });
      }
    }

    return points.sort((a, b) => a.month.localeCompare(b.month));
  }, [history, incomeRows, expenseCategories]);

  const historicalMonths = React.useMemo(
    () => mergedData.filter((point) => !point.isProjected),
    [mergedData],
  );

  const filteredData = React.useMemo<EnrichedPoint[]>(() => {
    const historical = mergedData.filter((point) => !point.isProjected);
    const future = mergedData.filter((point) => point.isProjected);

    if (timeRange === "this-year") {
      const year = new Date().getFullYear();
      const yearStart = `${year}-01`;
      const yearEnd = `${year}-12`;
      return mergedData.filter(
        (point) => point.month >= yearStart && point.month <= yearEnd,
      );
    }

    if (timeRange === "12m-forward") {
      return [...historical.slice(-1), ...future];
    }

    const count = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
    return historical.slice(-count);
  }, [mergedData, timeRange]);

  const todayMonthLabel = React.useMemo(
    () => toLabel(addMonths(new Date(), 0)),
    [],
  );

  const yMax = React.useMemo(() => {
    const max = Math.max(
      0,
      ...filteredData.flatMap((point) => [point.income, point.expenses]),
    );
    return Math.ceil((max * 1.2) / 1000) * 1000 || 10000;
  }, [filteredData]);

  const chartData = React.useMemo(() => {
    const hasFutureProjected = filteredData.some((point) => point.isProjected);
    const lastActualIdx = filteredData.reduce(
      (last, point, index) => (!point.isProjected ? index : last),
      -1,
    );

    return filteredData.map((point, index) => ({
      label: point.label,
      month: point.month,
      income: point.isProjected ? null : point.income,
      expenses: point.isProjected ? null : point.expenses,
      projIncome:
        point.isProjected || (hasFutureProjected && index === lastActualIdx)
          ? point.income
          : null,
      projExpenses:
        point.isProjected || (hasFutureProjected && index === lastActualIdx)
          ? point.expenses
          : null,
    }));
  }, [filteredData]);

  const earliestLabel =
    historicalMonths.length > 0 ? historicalMonths[0].label : null;

  const ranges = [
    { value: "this-year", label: "This year", disabled: false, reason: "" },
    {
      value: "3m",
      label: "3m",
      disabled: historicalMonths.length < 2,
      reason: `No cash flow going back 3 months${
        earliestLabel ? ` · earliest: ${earliestLabel}` : ""
      }`,
    },
    {
      value: "6m",
      label: "6m",
      disabled: historicalMonths.length < 4,
      reason: `No cash flow going back 6 months${
        earliestLabel ? ` · earliest: ${earliestLabel}` : ""
      }`,
    },
    {
      value: "12m",
      label: "12m",
      disabled: historicalMonths.length < 7,
      reason: `No cash flow going back 12 months${
        earliestLabel ? ` · earliest: ${earliestLabel}` : ""
      }`,
    },
    { value: "12m-forward", label: "12m →", disabled: false, reason: "" },
  ];

  return (
    <Card className={cn("bg-card border border-border/60 shadow-none", className)}>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 py-3">
        <div className="grid flex-1 gap-0.5">
          <CardTitle className="text-sm font-semibold">
            Income vs expenses
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {isNewUser
              ? "Projected from current setup · actuals appear as months close"
              : "Cash flow over time"}
          </p>
        </div>
        <div className="hidden items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5 sm:flex">
          {ranges.map(({ value, label, disabled, reason }) =>
            disabled ? (
              <button
                key={value}
                type="button"
                disabled
                title={reason}
                className="cursor-not-allowed select-none rounded-md px-2.5 py-1 text-xs text-muted-foreground/40"
              >
                {label}
              </button>
            ) : (
              <button
                key={value}
                type="button"
                onClick={() => setTimeRange(value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  timeRange === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 pt-0 sm:px-4">
        {isNewUser ? (
          <SnapshotBanner
            monthlyIncome={projectedIncome}
            monthlyExpenses={projectedExpenses}
            currency={currency}
          />
        ) : null}

        <div className="mb-2 flex flex-wrap items-center gap-3 px-0.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-1.5 w-5 rounded-full"
              style={{ backgroundColor: INCOME_COLOR }}
            />
            Income
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-1.5 w-5 rounded-full"
              style={{ backgroundColor: EXPENSES_COLOR }}
            />
            Expenses
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <svg width="20" height="8" className="overflow-visible">
              <line
                x1="0"
                y1="4"
                x2="20"
                y2="4"
                stroke={INCOME_COLOR}
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.55"
              />
            </svg>
            Projected
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-muted"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                minTickGap={24}
                className="text-xs text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                width={64}
                domain={[0, yMax]}
                tickFormatter={(value: number) =>
                  formatCurrency(value, currency)
                }
                className="text-xs text-muted-foreground"
              />
              <Tooltip
                cursor={false}
                content={(props) => (
                  <CashFlowTooltip
                    active={props.active}
                    payload={props.payload}
                    label={
                      typeof props.label === "string" ? props.label : undefined
                    }
                    currency={currency}
                  />
                )}
              />
              <ReferenceLine
                x={todayMonthLabel}
                stroke={INCOME_COLOR}
                strokeOpacity={0.3}
                strokeDasharray="4 3"
                label={{
                  value: "Today",
                  position: "top",
                  offset: 8,
                  fontSize: 10,
                  fill: "var(--muted-foreground)",
                }}
              />
              <Line
                dataKey="income"
                type="linear"
                stroke={INCOME_COLOR}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
              <Line
                dataKey="expenses"
                type="linear"
                stroke={EXPENSES_COLOR}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
              <Line
                dataKey="projIncome"
                type="linear"
                stroke={INCOME_COLOR}
                strokeWidth={2}
                strokeDasharray="4 3"
                strokeOpacity={0.55}
                dot={false}
                connectNulls
                legendType="none"
              />
              <Line
                dataKey="projExpenses"
                type="linear"
                stroke={EXPENSES_COLOR}
                strokeWidth={2}
                strokeDasharray="4 3"
                strokeOpacity={0.55}
                dot={false}
                connectNulls
                legendType="none"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
