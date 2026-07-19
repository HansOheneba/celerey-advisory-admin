"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { EditSubscriptionDialog } from "@/components/clients/edit-subscription-dialog";
import { RiskBadge, StatusBadge } from "@/components/clients/status-badge";
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
import type { Client } from "@/types/client";
import type { ClientDetail } from "@/types/client-detail";
import { cn } from "@/lib/utils";

const chartColors = ["#151339", "#1e3a5f", "#8c80f8", "#7eb8e8", "#10b981", "#f59e0b"];

type ClientDetailViewProps = {
  client: Client;
  detail: ClientDetail;
};

function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <p className={dashboardTheme.sectionLabel}>{label}</p>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function ClientDetailView({ client, detail }: ClientDetailViewProps) {
  const { state } = detail;
  const currency = (state.user.currency || client.currency) as
    | "USD"
    | "GHS"
    | "GBP";

  const holdingsValue = state.holdings.reduce(
    (sum, holding) => sum + (Number(holding.current_value) || 0),
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

  return (
    <div className={cn(dashboardTheme.page, "space-y-8")}>
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Avatar size="lg">
            <AvatarFallback className="bg-[#1B1856] text-white">
              {getInitials(client.firstName, client.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {client.firstName} {client.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {client.email}
                {client.phone ? ` · ${client.phone}` : ""}
              </p>
              <p className="text-sm text-muted-foreground">{client.location}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={client.status} />
              <RiskBadge riskLevel={client.riskLevel} />
              <Badge variant="secondary">{currency}</Badge>
              <Badge variant="outline">
                Profile {state.profileCompletionScore}%
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2 lg:text-right">
          <EditSubscriptionDialog
            clientId={client.id}
            subscription={detail.subscription}
          />
          <p className="text-xs text-muted-foreground">
            Last contact {formatDate(client.lastContactAt)} · Next review{" "}
            {formatDate(client.nextReviewAt)}
          </p>
        </div>
      </section>

      <Section label="At a glance" title="Advisory snapshot">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "AUA", value: formatCompactCurrency(aua) },
            { label: "Net position", value: formatCompactCurrency(netWorth) },
            {
              label: "Monthly surplus",
              value: formatCurrency(
                state.cashFlowSummary.monthly_surplus,
                currency,
              ),
            },
            {
              label: "Savings rate",
              value: `${state.cashFlowSummary.savings_rate_pct}%`,
            },
          ].map((item) => (
            <Card key={item.label} className={dashboardTheme.kpiCard}>
              <CardHeader className="pb-2">
                <p className={dashboardTheme.sectionLabel}>{item.label}</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section label="Profile" title="Client identity">
        <Card className={dashboardTheme.card}>
          <CardContent className="grid gap-4 pt-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["Occupation", state.user.occupation],
              ["Marital status", titleCase(state.user.marital_status)],
              ["Dependents", String(state.user.dependents)],
              ["Date of birth", formatDate(state.user.date_of_birth)],
              [
                "Citizenships",
                state.user.citizenships?.join(", ") || "—",
              ],
              ["Account mode", titleCase(state.user.account_mode)],
              [
                "Effective tax rate",
                `${state.taxProfile.effectiveTaxRatePct}%`,
              ],
              ["Filing status", titleCase(state.taxProfile.filingStatus)],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))}
            <div className="md:col-span-2 xl:col-span-3">
              <p className="text-xs text-muted-foreground">Bio</p>
              <p className="text-sm leading-relaxed">{state.user.bio}</p>
            </div>
          </CardContent>
        </Card>

        {state.dependents.length > 0 ? (
          <Card className={dashboardTheme.card}>
            <CardHeader>
              <CardTitle className="text-base">Dependents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.dependents.map((dependent) => (
                <div
                  key={dependent.id}
                  className="flex items-center justify-between gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{dependent.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {titleCase(dependent.relationship)} · Born{" "}
                      {formatDate(dependent.dateOfBirth)}
                    </p>
                  </div>
                  {dependent.financialReliance ? (
                    <Badge variant="secondary">
                      {titleCase(dependent.financialReliance)}
                    </Badge>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </Section>

      <Section label="Risk" title="Risk assessment">
        <Card className={dashboardTheme.card}>
          <CardContent className="grid gap-4 pt-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Risk band</p>
              <p className="text-xl font-semibold">
                {state.riskAssessment.result.risk_band}
              </p>
              <p className="text-sm text-muted-foreground">
                {state.riskAssessment.result.description}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Strategy</p>
              <p className="text-sm leading-relaxed">
                {state.riskAssessment.result.strategy}
              </p>
              <p className="text-xs text-muted-foreground">
                Score {state.riskAssessment.scoring.final_score} · Assessed{" "}
                {formatDate(state.riskAssessment.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section label="Cash flow" title="Income and spending">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className={dashboardTheme.card}>
            <CardHeader>
              <CardTitle className="text-base">Monthly summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Income</span>
                <span className="font-medium">
                  {formatCurrency(
                    state.cashFlowSummary.monthly_income,
                    currency,
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expenses</span>
                <span className="font-medium">
                  {formatCurrency(
                    state.cashFlowSummary.monthly_expenses,
                    currency,
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emergency fund</span>
                <span className="font-medium">
                  {state.emergencyFund.computed?.monthsCovered ??
                    state.emergencyFund.targetMonths}{" "}
                  months
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(dashboardTheme.card, "lg:col-span-2")}>
            <CardHeader>
              <CardTitle className="text-base">12-month surplus</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={state.cashFlowHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="surplus" fill="#151339" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className={dashboardTheme.tableShell}>
            <CardHeader>
              <CardTitle className="text-base">Income</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Cadence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.incomeRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      {formatCurrency(row.amount, currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {titleCase(row.recurringType)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className={dashboardTheme.tableShell}>
            <CardHeader>
              <CardTitle className="text-base">Expenses</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.expenseCategories.slice(0, 10).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      {formatCurrency(row.amount, currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.essential ? "Essential" : "Discretionary"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </Section>

      <Section label="Assets" title="Holdings and allocation">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className={dashboardTheme.card}>
            <CardHeader>
              <CardTitle className="text-base">Allocation</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={state.allocation}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={50}
                    outerRadius={85}
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

          <Card className={dashboardTheme.card}>
            <CardHeader>
              <CardTitle className="text-base">Portfolio value</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={state.portfolioPerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
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
        </div>

        <Card className={dashboardTheme.tableShell}>
          <CardHeader>
            <CardTitle className="text-base">Holdings</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.holdings.map((holding) => (
                <TableRow key={holding.holding_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{holding.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {holding.symbol || "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {titleCase(String(holding.asset_type).replaceAll("_", " "))}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(Number(holding.current_value) || 0, currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className={dashboardTheme.tableShell}>
          <CardHeader>
            <CardTitle className="text-base">Accounts</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {account.institution}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(account.balance, currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Section>

      <Section label="Properties & liabilities" title="Balance sheet items">
        <div className="grid gap-4 lg:grid-cols-2">
          {state.propertyAssets.map((property) => (
            <Card key={property.property_id} className={dashboardTheme.card}>
              <CardHeader>
                <CardTitle className="text-base">{property.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  {property.city}, {property.country} ·{" "}
                  {titleCase(String(property.property_type))}
                </p>
                <p className="font-medium">
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

        <Card className={dashboardTheme.tableShell}>
          <CardHeader>
            <CardTitle className="text-base">Liabilities</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Lender</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.liabilities.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.lender}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(item.balance, currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Section>

      <Section label="Goals" title="Financial goals">
        <div className="mb-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>{state.goalsMeta.activeGoals} active</span>
          <span>·</span>
          <span>{state.goalsMeta.completedGoals} completed</span>
          <span>·</span>
          <span>
            {formatCurrency(state.goalsMeta.totalMonthlyNeeded, currency)} / mo
            needed
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {state.goals.map((goal) => (
            <Card key={goal.id} className={dashboardTheme.card}>
              <CardHeader>
                <CardTitle className="text-base">{goal.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">{goal.description}</p>
                <div className="flex justify-between">
                  <span>Current</span>
                  <span className="font-medium">
                    {formatCurrency(Number(goal.current) || 0, currency)}
                  </span>
                </div>
                {goal.target != null ? (
                  <div className="flex justify-between">
                    <span>Target</span>
                    <span className="font-medium">
                      {formatCurrency(Number(goal.target) || 0, currency)}
                    </span>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <Badge variant="secondary">{titleCase(goal.category)}</Badge>
                  <Badge variant="outline">
                    {typeof goal.priority === "number"
                      ? `Priority ${goal.priority}`
                      : titleCase(goal.priority)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section label="Insurance" title="Protection">
        <Card className={dashboardTheme.tableShell}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Premium</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.insurancePolicies.map((policy) => (
                <TableRow key={policy.policy_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{policy.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {titleCase(policy.category)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {policy.provider}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(Number(policy.coverage_amount) || 0, currency)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(Number(policy.premium_monthly) || 0, currency)}
                    /mo
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Section>

      <Section label="Retirement" title="Retirement plan">
        <Card className={dashboardTheme.card}>
          <CardContent className="grid gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Current age", String(state.retirement.currentAge)],
              ["Retirement age", String(state.retirement.retirementAge)],
              [
                "Desired monthly income",
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
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      <Section label="Freshness" title="Data last updated">
        <Card className={dashboardTheme.card}>
          <CardContent className="flex flex-wrap gap-2 pt-4">
            {state.freshness.map((item) => (
              <Badge key={item.section} variant="secondary">
                {titleCase(item.section.replaceAll("_", " "))} ·{" "}
                {formatDate(item.updatedAt)}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
