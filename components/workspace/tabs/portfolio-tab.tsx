"use client";

import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { assetTypeLabel } from "@/lib/clients/asset-holdings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ClientDetailState } from "@/types/client-detail";
import type { Client } from "@/types/client";

import { CHART_PALETTE, CHART_PRIMARY } from "@/lib/chart-colors";
import {
  AddAccountDialog,
  AddHoldingDialog,
  EditHoldingDialog,
} from "@/components/clients/profile/profile-editors";
import { RemoveProfileItemButton } from "@/components/clients/profile/remove-profile-item-button";

const CHART_COLORS = [...CHART_PALETTE, "#10b981", "#f59e0b", "#ef4444"];

type PortfolioTabProps = {
  client: Client;
  detail: ClientDetailState;
  idleCashPct: number;
  targetCashPct: number;
  driftPct: number;
  heldAwayUsd: number;
  canEdit: boolean;
};

export function PortfolioTab({
  client,
  detail,
  idleCashPct,
  targetCashPct,
  driftPct,
  heldAwayUsd,
  canEdit,
}: PortfolioTabProps) {
  const currency = client.currency;
  const holdings = [...detail.holdings].sort(
    (a, b) => (b.current_value ?? 0) - (a.current_value ?? 0),
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
            <CardDescription>
              {idleCashPct.toFixed(1)}% cash vs {targetCashPct}% target.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-48 w-full sm:w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={detail.allocation}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                    >
                      {detail.allocation.map((entry, index) => (
                        <Cell
                          key={entry.label}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(
                          typeof value === "number" ? value : 0,
                          currency,
                        )
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <ul className="flex-1 space-y-1.5">
                {detail.allocation.map((slice, index) => (
                  <li
                    key={slice.label}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <span className="truncate">{slice.label}</span>
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {slice.percentage}% ·{" "}
                      {formatCompactCurrency(slice.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Portfolio value</CardTitle>
            <CardDescription>
              Trailing twelve months, including contributions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={detail.portfolioPerformance}>
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis
                    tickFormatter={(value: number) =>
                      formatCompactCurrency(value)
                    }
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    width={56}
                  />
                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(
                        typeof value === "number" ? value : 0,
                        currency,
                      )
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_PRIMARY}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border pt-3">
              <MiniStat
                label="Model drift"
                value={`${driftPct.toFixed(1)} pts`}
                tone={driftPct >= 8 ? "bad" : driftPct >= 5 ? "warn" : "good"}
              />
              <MiniStat
                label="Held away"
                value={
                  heldAwayUsd > 0 ? formatCompactCurrency(heldAwayUsd) : "None"
                }
                tone={heldAwayUsd > 0 ? "warn" : "good"}
              />
              <MiniStat
                label="Positions"
                value={String(holdings.length)}
                tone="good"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>
            {holdings.length} positions plus {detail.accounts.length} cash
            account{detail.accounts.length === 1 ? "" : "s"}.
          </CardDescription>
          {canEdit ? (
            <CardAction>
              <div className="flex flex-wrap gap-2">
                <AddHoldingDialog clientId={client.id} />
                <AddAccountDialog clientId={client.id} />
              </div>
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holding</TableHead>
                <TableHead>Asset class</TableHead>
                <TableHead className="text-right">Cost basis</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Gain</TableHead>
                {canEdit ? <TableHead className="w-10" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding) => {
                const value = holding.current_value ?? 0;
                const cost = holding.cost_basis ?? 0;
                const gainPct = cost > 0 ? ((value - cost) / cost) * 100 : 0;

                return (
                  <TableRow key={holding.holding_id}>
                    <TableCell className="font-medium">
                      {holding.name}
                      {holding.symbol ? (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          {holding.symbol}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {assetTypeLabel(String(holding.asset_type))}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(cost, currency)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(value, currency)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right",
                        gainPct >= 0 ? "text-success" : "text-destructive",
                      )}
                    >
                      {gainPct >= 0 ? "+" : ""}
                      {gainPct.toFixed(1)}%
                    </TableCell>
                    {canEdit ? (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditHoldingDialog
                            clientId={client.id}
                            holding={{
                              holding_id: holding.holding_id,
                              name: holding.name,
                              current_value: holding.current_value,
                              quantity: holding.quantity,
                            }}
                          />
                          <RemoveProfileItemButton
                            clientId={client.id}
                            collection="holdings"
                            itemId={holding.holding_id}
                            label={holding.name}
                          />
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
              {detail.accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell className="text-muted-foreground">Cash</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    —
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(account.balance, currency)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    —
                  </TableCell>
                  {canEdit ? (
                    <TableCell className="text-right">
                      <RemoveProfileItemButton
                        clientId={client.id}
                        collection="accounts"
                        itemId={account.id}
                        label={account.name}
                      />
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "bad";
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-medium",
          tone === "bad" && "text-destructive",
          tone === "warn" && "text-warning",
        )}
      >
        {value}
      </p>
    </div>
  );
}
