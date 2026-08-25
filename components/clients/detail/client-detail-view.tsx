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
import { AssignAdvisorControl } from "@/components/clients/assign-advisor-control";
import { ClientAvailabilityCard } from "@/components/clients/client-availability-card";
import { ClientDocumentsCard } from "@/components/clients/client-documents-card";
import { ClientAdvisorySection } from "@/components/clients/detail/client-advisory-section";
import { ClientCashFlowChart } from "@/components/clients/detail/client-cash-flow-chart";
import { EditSubscriptionDialog } from "@/components/clients/edit-subscription-dialog";
import { RiskBadge, StatusBadge } from "@/components/clients/status-badge";
import type { Advisor } from "@/types/advisor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardTheme } from "@/lib/dashboard-theme";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  getInitials,
  titleCase,
} from "@/lib/format";
import type { Appointment, AdvisoryEntitlement } from "@/lib/appointments/types";
import type { ClientAvailability } from "@/lib/availability/types";
import type { ClientDocument } from "@/lib/documents/types";
import type { Client } from "@/types/client";
import type { ClientDetail } from "@/types/client-detail";
import { cn } from "@/lib/utils";

const chartColors = [
  "#151339",
  "#1e3a5f",
  "#8c80f8",
  "#7eb8e8",
  "#10b981",
  "#f59e0b",
];

type Currency = "USD" | "GHS" | "GBP";

function firstNumber(...values: unknown[]): number {
  for (const value of values) {
    if (value == null || value === "") continue;
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(num)) return num;
  }
  return 0;
}

function holdingValue(holding: ClientDetail["state"]["holdings"][number]) {
  return firstNumber(holding.current_value, holding.cost_basis);
}

type ClientDetailViewProps = {
  client: Client;
  detail: ClientDetail;
  canViewAnalysis?: boolean;
  canManageSubscriptions?: boolean;
  advisors?: Advisor[];
  appointments?: Appointment[];
  availability?: ClientAvailability;
  documents?: ClientDocument[];
  entitlement?: AdvisoryEntitlement | null;
  canEditAvailability?: boolean;
};

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      {children}
    </section>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function CompactTable({
  title,
  headers,
  children,
}: {
  title: string;
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <Card className={cn(dashboardTheme.tableShell, "overflow-hidden")}>
      <CardHeader className="px-3 py-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header} className="h-8 px-3 text-xs">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </Card>
  );
}

function hasRetirementData(retirement: ClientDetail["state"]["retirement"]) {
  return (
    retirement.currentAge > 0 ||
    retirement.retirementAge > 0 ||
    retirement.monthlySavings > 0 ||
    retirement.currentInvested > 0 ||
    retirement.desiredMonthlyIncome > 0 ||
    retirement.existingPensionBalance > 0
  );
}

function hasEmergencyFund(fund: ClientDetail["state"]["emergencyFund"]) {
  return (
    fund.targetMonths > 0 ||
    fund.currentCashBalance > 0 ||
    Number(fund.computed?.monthsCovered) > 0 ||
    Number(fund.computed?.gap) > 0
  );
}

export function ClientDetailView({
  client,
  detail,
  canViewAnalysis = false,
  canManageSubscriptions = false,
  advisors = [],
  appointments = [],
  availability,
  documents = [],
  entitlement = null,
  canEditAvailability = false,
}: ClientDetailViewProps) {
  const { state } = detail;
  const currency = (state.user.currency || client.currency) as Currency;

  const holdingsValue = state.holdings.reduce(
    (sum, holding) => sum + holdingValue(holding),
    0,
  );
  const accountsValue = state.accounts.reduce(
    (sum, account) => sum + (Number(account.balance) || 0),
    0,
  );
  const propertyValue = state.propertyAssets.reduce((sum, asset) => {
    return (
      sum +
      (Number(asset.market_value) ||
        Number(asset.current_value) ||
        Number(asset.purchase_price) ||
        0)
    );
  }, 0);
  const liabilityValue = state.liabilities.reduce(
    (sum, item) => sum + (Number(item.balance) || 0),
    0,
  );
  const aua = holdingsValue + accountsValue + propertyValue;
  const netWorth = aua - liabilityValue;

  const profileFields = [
    ["Occupation", titleCase(state.user.occupation)],
    ["Marital status", titleCase(state.user.marital_status)],
    [
      "Dependents",
      state.user.dependents != null ? String(state.user.dependents) : "",
    ],
    ["Date of birth", formatDate(state.user.date_of_birth ?? "")],
    ["Citizenships", state.user.citizenships?.join(", ") ?? ""],
    ["Account mode", titleCase(state.user.account_mode)],
    ...(state.taxProfile
      ? [
          ["Effective tax", `${state.taxProfile.effectiveTaxRatePct}%`],
          ["Filing status", titleCase(state.taxProfile.filingStatus)],
        ]
      : []),
  ].filter(([, value]) => value && value !== "—");

  const hasCashFlow =
    state.incomeRows.length > 0 ||
    state.expenseCategories.length > 0 ||
    state.cashFlowHistory.length > 0;
  const hasBalanceSheet =
    state.propertyAssets.length > 0 || state.liabilities.length > 0;
  const hasGoals = state.goals.length > 0;
  const hasInsurance = state.insurancePolicies.length > 0;
  const showRetirement = hasRetirementData(state.retirement);
  const showEmergency = hasEmergencyFund(state.emergencyFund);
  const showRisk = Boolean(
    state.riskAssessment?.result || state.riskAssessment?.scoring,
  );
  const showProfile =
    profileFields.length > 0 ||
    Boolean(state.user.bio) ||
    state.dependents.length > 0;
  const showFreshness = state.freshness.length > 0;

  const kpis = [
    { label: "AUA", value: formatCompactCurrency(aua) },
    { label: "Net", value: formatCompactCurrency(netWorth) },
    {
      label: "Surplus / mo",
      value: formatCurrency(state.cashFlowSummary.monthly_surplus, currency),
    },
    {
      label: "Savings",
      value: `${state.cashFlowSummary.savings_rate_pct}%`,
    },
    {
      label: "Income / mo",
      value: formatCurrency(state.cashFlowSummary.monthly_income, currency),
    },
    {
      label: "Spend / mo",
      value: formatCurrency(state.cashFlowSummary.monthly_expenses, currency),
    },
  ];

  return (
    <div className={dashboardTheme.page}>
      {/* Identity + KPI strip */}
      <section className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar size="lg">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(client.firstName, client.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={dashboardTheme.pageTitle}>
                  {client.firstName} {client.lastName}
                </h2>
                <StatusBadge status={client.status} />
                <RiskBadge riskLevel={client.riskLevel} />
                <Badge variant="secondary">{currency}</Badge>
                {state.profileCompletionScore > 0 ? (
                  <Badge variant="outline">
                    Profile {state.profileCompletionScore}%
                  </Badge>
                ) : null}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {[client.email, client.phone, client.location]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="text-xs text-muted-foreground">
                Last contact {formatDate(client.lastContactAt)} · Next review{" "}
                {formatDate(client.nextReviewAt)} · Joined{" "}
                {formatDate(client.joinedAt)}
              </p>
              <p className="text-xs text-muted-foreground">
                Advisor {client.advisorName || "Unassigned"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            {canManageSubscriptions ? (
              <>
                <EditSubscriptionDialog
                  clientId={client.id}
                  subscription={detail.subscription}
                />
                <AssignAdvisorControl
                  clientId={client.id}
                  advisorId={client.advisorId}
                  advisors={advisors}
                  compact
                />
              </>
            ) : null}
          </div>
        </div>

        {client.notes ? (
          <Card className={dashboardTheme.card}>
            <CardHeader className="pb-2">
              <p className={dashboardTheme.sectionLabel}>Notes</p>
              <CardTitle className="text-base font-semibold">
                Relationship notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {client.notes}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {canViewAnalysis ? (
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-3 xl:grid-cols-6">
            {kpis.map((item) => (
              <div key={item.label} className="bg-card px-3 py-2.5">
                <p className={dashboardTheme.sectionLabel}>{item.label}</p>
                <p className="mt-0.5 text-base font-semibold tabular-nums tracking-tight">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {availability ? (
        <ClientAvailabilityCard
          clientId={client.id}
          initial={availability}
          canEdit={canEditAvailability}
        />
      ) : null}

      <ClientDocumentsCard
        clientId={client.id}
        initialDocuments={documents}
        canEdit={canEditAvailability}
      />

      <ClientAdvisorySection
        clientId={client.id}
        appointments={appointments}
        entitlement={entitlement}
        canEditEntitlement={canEditAvailability}
      />

      {!canViewAnalysis ? (
        <Card className={dashboardTheme.card}>
          <CardHeader>
            <p className={dashboardTheme.sectionLabel}>Access</p>
            <CardTitle className="text-base font-semibold">
              Contact profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>
              Financial analysis and subscription management are limited to
              admin accounts. You can review contact details and keep the
              relationship on schedule.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Profile + risk side by side when present */}
      {canViewAnalysis && (showProfile || showRisk || showEmergency) ? (
        <div
          className={cn(
            "grid gap-3",
            showProfile && (showRisk || showEmergency)
              ? "lg:grid-cols-[1.4fr_1fr]"
              : "grid-cols-1",
          )}
        >
          {showProfile ? (
            <Section title="Profile">
              <Card className={dashboardTheme.card}>
                <CardContent className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
                  {profileFields.map(([label, value]) => (
                    <MetaCell key={label} label={label} value={value} />
                  ))}
                  {state.user.bio ? (
                    <div className="sm:col-span-2 xl:col-span-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Bio
                      </p>
                      <p className="text-sm leading-snug">{state.user.bio}</p>
                    </div>
                  ) : null}
                  {state.dependents.length > 0 ? (
                    <div className="space-y-1.5 sm:col-span-2 xl:col-span-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Dependents
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {state.dependents.map((dependent) => (
                          <Badge key={dependent.id} variant="secondary">
                            {dependent.name}
                            {dependent.relationship
                              ? ` · ${titleCase(dependent.relationship)}`
                              : ""}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </Section>
          ) : null}

          <div className="space-y-3">
            {showRisk && state.riskAssessment ? (
              <Section title="Risk">
                <Card className={dashboardTheme.card}>
                  <CardContent className="space-y-1.5 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-base font-semibold">
                        {state.riskAssessment.result?.risk_band ??
                          "Not assessed"}
                      </p>
                      {state.riskAssessment.scoring ? (
                        <p className="text-xs text-muted-foreground">
                          Score {state.riskAssessment.scoring.final_score}
                        </p>
                      ) : null}
                    </div>
                    {state.riskAssessment.result?.description ? (
                      <p className="text-sm leading-snug text-muted-foreground">
                        {state.riskAssessment.result.description}
                      </p>
                    ) : null}
                    {state.riskAssessment.result?.strategy ||
                    state.riskAssessment.created_at ? (
                      <p className="text-xs text-muted-foreground">
                        {[
                          state.riskAssessment.result?.strategy,
                          state.riskAssessment.created_at
                            ? `Assessed ${formatDate(state.riskAssessment.created_at)}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </Section>
            ) : null}

            {showEmergency ? (
              <Section title="Emergency fund">
                <Card className={dashboardTheme.card}>
                  <CardContent className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
                    <MetaCell
                      label="Target"
                      value={`${state.emergencyFund.targetMonths} mo`}
                    />
                    <MetaCell
                      label="Cash"
                      value={formatCurrency(
                        state.emergencyFund.currentCashBalance,
                        currency,
                      )}
                    />
                    <MetaCell
                      label="Runway"
                      value={`${state.emergencyFund.computed?.monthsCovered ?? 0} mo`}
                    />
                    <MetaCell
                      label="Shortfall"
                      value={formatCurrency(
                        Number(state.emergencyFund.computed?.gap) || 0,
                        currency,
                      )}
                    />
                  </CardContent>
                </Card>
              </Section>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Cash flow */}
      {canViewAnalysis && hasCashFlow ? (
        <Section title="Cash flow">
          <div className="space-y-3">
            <ClientCashFlowChart
              history={state.cashFlowHistory}
              incomeRows={state.incomeRows}
              expenseCategories={state.expenseCategories}
              currency={currency}
            />

            <div className="grid gap-3 xl:grid-cols-2">
              {state.incomeRows.length > 0 ? (
                <CompactTable
                  title="Income"
                  headers={["Source", "Amount", "Cadence"]}
                >
                  {state.incomeRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="px-3 py-1.5 text-sm">
                        {row.name}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-sm tabular-nums">
                        {formatCurrency(row.amount, currency)}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-xs text-muted-foreground">
                        {titleCase(row.recurringType)}
                      </TableCell>
                    </TableRow>
                  ))}
                </CompactTable>
              ) : null}

              {state.expenseCategories.length > 0 ? (
                <CompactTable
                  title="Expenses"
                  headers={["Category", "Amount", "Type"]}
                >
                  {state.expenseCategories.slice(0, 12).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="px-3 py-1.5 text-sm">
                        {row.name}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-sm tabular-nums">
                        {formatCurrency(row.amount, currency)}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-xs text-muted-foreground">
                        {row.essential ? "Essential" : "Discretionary"}
                      </TableCell>
                    </TableRow>
                  ))}
                </CompactTable>
              ) : null}
            </div>
          </div>
        </Section>
      ) : null}

      {/* Goals */}
      {canViewAnalysis && hasGoals ? (
        <Section title="Goals">
          <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{state.goalsMeta.activeGoals} active</span>
            <span>{state.goalsMeta.completedGoals} completed</span>
            <span>
              {formatCurrency(state.goalsMeta.totalMonthlyNeeded, currency)} / mo
              needed
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {state.goals.map((goal) => {
              const progress =
                goal.target && goal.target > 0
                  ? Math.min(
                      100,
                      Math.round((Number(goal.current) / Number(goal.target)) * 100),
                    )
                  : 0;

              return (
                <Card key={goal.id} className={dashboardTheme.card}>
                  <CardContent className="space-y-2 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug">
                        {goal.title}
                      </p>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {typeof goal.priority === "number"
                          ? `P${goal.priority}`
                          : titleCase(goal.priority)}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {formatCurrency(Number(goal.current) || 0, currency)}
                      </span>
                      {goal.target != null ? (
                        <span className="font-medium tabular-nums">
                          {formatCurrency(Number(goal.target) || 0, currency)}
                        </span>
                      ) : null}
                    </div>
                    {goal.target != null ? (
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    ) : null}
                    {goal.category ? (
                      <p className="text-[11px] text-muted-foreground">
                        {titleCase(goal.category)}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Section>
      ) : null}

      {/* Assets */}
      {canViewAnalysis ? (
        <Section title="Assets">
          <div className="space-y-3">
            {state.allocation.length > 0 ||
            state.portfolioPerformance.length > 0 ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {state.allocation.length > 0 ? (
                  <Card className={dashboardTheme.card}>
                    <CardHeader className="px-3 py-2">
                      <CardTitle className="text-sm font-semibold">
                        Allocation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-40 px-2 pb-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={state.allocation}
                            dataKey="value"
                            nameKey="label"
                            innerRadius={36}
                            outerRadius={58}
                          >
                            {state.allocation.map((entry, index) => (
                              <Cell
                                key={entry.label}
                                fill={chartColors[index % chartColors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) =>
                              formatCompactCurrency(
                                typeof value === "number" ? value : 0,
                              )
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ) : null}

                {state.portfolioPerformance.length > 0 ? (
                  <Card className={dashboardTheme.card}>
                    <CardHeader className="px-3 py-2">
                      <CardTitle className="text-sm font-semibold">
                        Portfolio value
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-40 px-2 pb-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={state.portfolioPerformance}>
                          <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            className="text-xs"
                          />
                          <YAxis hide />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#151339"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-3 xl:grid-cols-2">
              {state.holdings.length > 0 ? (
                <CompactTable
                  title="Holdings"
                  headers={["Name", "Type", "Value"]}
                >
                  {state.holdings.map((holding) => (
                    <TableRow key={holding.holding_id}>
                      <TableCell className="px-3 py-1.5">
                        <p className="text-sm font-medium">{holding.name}</p>
                        {holding.symbol ? (
                          <p className="text-[11px] text-muted-foreground">
                            {holding.symbol}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-xs text-muted-foreground">
                        {titleCase(
                          String(holding.asset_type).replaceAll("_", " "),
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-sm tabular-nums">
                        {formatCurrency(holdingValue(holding), currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </CompactTable>
              ) : (
                <Card className={dashboardTheme.card}>
                  <CardHeader className="px-3 py-2">
                    <CardTitle className="text-sm font-semibold">
                      Holdings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div
                      className={cn(
                        dashboardTheme.emptyState,
                        "px-4 py-8 text-center",
                      )}
                    >
                      <p className="text-sm font-medium">
                        No holdings recorded
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        This client has not added any investment holdings.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {state.accounts.length > 0 ? (
                <CompactTable
                  title="Accounts"
                  headers={["Account", "Institution", "Balance"]}
                >
                  {state.accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="px-3 py-1.5 text-sm">
                        {account.name}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-xs text-muted-foreground">
                        {account.institution}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-sm tabular-nums">
                        {formatCurrency(account.balance, currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </CompactTable>
              ) : null}
            </div>
          </div>
        </Section>
      ) : null}

      {/* Balance sheet */}
      {canViewAnalysis && hasBalanceSheet ? (
        <Section title="Properties & liabilities">
          <div className="space-y-3">
            {state.propertyAssets.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {state.propertyAssets.map((property) => (
                  <Card
                    key={property.property_id}
                    className={dashboardTheme.card}
                  >
                    <CardContent className="space-y-1 p-3">
                      <p className="text-sm font-semibold">{property.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[property.city, property.country]
                          .filter(Boolean)
                          .join(", ")}
                        {property.property_type
                          ? ` · ${titleCase(String(property.property_type))}`
                          : ""}
                      </p>
                      <p className="text-sm font-medium tabular-nums">
                        {formatCurrency(
                          Number(property.market_value) ||
                            Number(property.current_value) ||
                            Number(property.purchase_price) ||
                            0,
                          currency,
                        )}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}

            {state.liabilities.length > 0 ? (
              <CompactTable
                title="Liabilities"
                headers={["Name", "Lender", "Balance"]}
              >
                {state.liabilities.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-3 py-1.5 text-sm">
                      {item.name}
                    </TableCell>
                    <TableCell className="px-3 py-1.5 text-xs text-muted-foreground">
                      {item.lender}
                    </TableCell>
                    <TableCell className="px-3 py-1.5 text-sm tabular-nums">
                      {formatCurrency(item.balance, currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </CompactTable>
            ) : null}
          </div>
        </Section>
      ) : null}

      {/* Insurance */}
      {canViewAnalysis && hasInsurance ? (
        <Section title="Insurance">
          <CompactTable
            title="Policies"
            headers={["Policy", "Provider", "Coverage", "Premium"]}
          >
            {state.insurancePolicies.map((policy) => (
              <TableRow key={policy.policy_id}>
                <TableCell className="px-3 py-1.5">
                  <p className="text-sm font-medium">{policy.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {titleCase(policy.category)}
                  </p>
                </TableCell>
                <TableCell className="px-3 py-1.5 text-xs text-muted-foreground">
                  {policy.provider}
                </TableCell>
                <TableCell className="px-3 py-1.5 text-sm tabular-nums">
                  {formatCurrency(Number(policy.coverage_amount) || 0, currency)}
                </TableCell>
                <TableCell className="px-3 py-1.5 text-sm tabular-nums">
                  {formatCurrency(Number(policy.premium_monthly) || 0, currency)}
                  /mo
                </TableCell>
              </TableRow>
            ))}
          </CompactTable>
        </Section>
      ) : null}

      {/* Retirement */}
      {canViewAnalysis && showRetirement ? (
        <Section title="Retirement">
          <Card className={dashboardTheme.card}>
            <CardContent className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
              {[
                ["Current age", String(state.retirement.currentAge)],
                ["Retirement age", String(state.retirement.retirementAge)],
                [
                  "Desired income / mo",
                  formatCurrency(
                    state.retirement.desiredMonthlyIncome,
                    currency,
                  ),
                ],
                [
                  "Current invested",
                  formatCurrency(state.retirement.currentInvested, currency),
                ],
                [
                  "Monthly savings",
                  formatCurrency(state.retirement.monthlySavings, currency),
                ],
                [
                  "Pension balance",
                  formatCurrency(
                    state.retirement.existingPensionBalance,
                    currency,
                  ),
                ],
                ["Expected return", `${state.retirement.expectedReturnPct}%`],
                [
                  "Safe withdrawal",
                  `${state.retirement.safeWithdrawalRatePct}%`,
                ],
              ].map(([label, value]) => (
                <MetaCell key={label} label={label} value={value} />
              ))}
            </CardContent>
          </Card>
        </Section>
      ) : null}

      {canViewAnalysis && showFreshness ? (
        <Section title="Data freshness">
          <div className="flex flex-wrap gap-1.5">
            {state.freshness.map((item) => (
              <Badge key={item.section} variant="secondary" className="text-[11px]">
                {titleCase(item.section.replaceAll("_", " "))} ·{" "}
                {formatDate(item.updatedAt)}
              </Badge>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
