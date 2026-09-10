import { ClientCashFlowChart } from "@/components/clients/detail/client-cash-flow-chart";
import {
  AddExpenseDialog,
  AddGoalDialog,
  AddIncomeDialog,
  AddInsuranceDialog,
  AddLiabilityDialog,
  AddPropertyDialog,
  EditEmergencyFundDialog,
  EditRetirementDialog,
} from "@/components/clients/profile/profile-editors";
import { RemoveProfileItemButton } from "@/components/clients/profile/remove-profile-item-button";
import { ListRow } from "@/components/shared/list-row";
import { SectionPanel } from "@/components/shared/section-panel";
import { StatGrid, StatItem } from "@/components/shared/stat-grid";
import { Badge } from "@/components/ui/badge";
import { dashboardTheme } from "@/lib/dashboard-theme";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { DemoClientRecord } from "@/lib/demo/types";

type PlanTabProps = {
  record: DemoClientRecord;
  canEdit: boolean;
};

export function PlanTab({ record, canEdit }: PlanTabProps) {
  const { client, detail } = record;
  const currency = client.currency;
  const emergencyMonths = detail.emergencyFund.computed?.monthsCovered ?? 0;
  const emergencyGap = detail.emergencyFund.computed?.gap ?? 0;
  const clientId = client.id;

  return (
    <div className="space-y-4">
      <SectionPanel
        title="Goals"
        description={`${formatCurrency(detail.goalsMeta.totalMonthlyNeeded, currency)} a month required across ${detail.goalsMeta.activeGoals} active goals.`}
        variant="success"
        actions={canEdit ? <AddGoalDialog clientId={clientId} /> : null}
      >
        {detail.goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No goals yet. Add one under Plan.
          </p>
        ) : (
          <div className={dashboardTheme.tableShell}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Goal</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Funded</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead className="text-right">Horizon</TableHead>
                  {canEdit ? <TableHead className="w-10" /> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.goals.map((goal) => {
                  const target = goal.target ?? 0;
                  const pct =
                    target > 0
                      ? Math.round((goal.current / target) * 100)
                      : 0;

                  return (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">
                        {goal.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {goal.category}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={pct >= 85 ? "secondary" : "destructive"}
                        >
                          {pct}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(target, currency)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(
                          goal.monthlyContribution ?? 0,
                          currency,
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {goal.yearsRemaining ?? "—"} yr
                      </TableCell>
                      {canEdit ? (
                        <TableCell className="text-right">
                          <RemoveProfileItemButton
                            clientId={clientId}
                            collection="goals"
                            itemId={goal.id}
                            label={goal.title}
                          />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionPanel>

      {canEdit ? (
        <div className="flex flex-wrap justify-end gap-2">
          <AddIncomeDialog clientId={clientId} />
          <AddExpenseDialog clientId={clientId} />
        </div>
      ) : null}

      <ClientCashFlowChart
        history={detail.cashFlowHistory}
        incomeRows={detail.incomeRows}
        expenseCategories={detail.expenseCategories}
        currency={currency}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionPanel
          title="Retirement"
          description={`Retiring at ${detail.retirement.retirementAge}, currently ${detail.retirement.currentAge}.`}
          variant="brand"
          actions={
            canEdit ? (
              <EditRetirementDialog
                clientId={clientId}
                retirement={detail.retirement}
              />
            ) : null
          }
        >
          <StatGrid columns={2}>
            <StatItem
              label="Invested today"
              value={formatCompactCurrency(detail.retirement.currentInvested)}
            />
            <StatItem
              label="Monthly savings"
              value={formatCurrency(
                detail.retirement.monthlySavings,
                currency,
              )}
            />
            <StatItem
              label="Pension balance"
              value={formatCompactCurrency(
                detail.retirement.existingPensionBalance,
              )}
            />
            <StatItem
              label="Desired income"
              value={`${formatCurrency(detail.retirement.desiredMonthlyIncome, currency)}/mo`}
            />
            <StatItem
              label="Expected return"
              value={`${detail.retirement.expectedReturnPct}%`}
            />
            <StatItem
              label="Safe withdrawal"
              value={`${detail.retirement.safeWithdrawalRatePct}%`}
            />
          </StatGrid>
        </SectionPanel>

        <SectionPanel
          title="Emergency fund"
          description={`${emergencyMonths} of ${detail.emergencyFund.targetMonths} months covered.`}
          variant="warning"
          actions={
            canEdit ? (
              <EditEmergencyFundDialog
                clientId={clientId}
                emergencyFund={detail.emergencyFund}
              />
            ) : null
          }
        >
          <StatGrid columns={2}>
            <StatItem
              label="Cash held"
              value={formatCurrency(
                detail.emergencyFund.currentCashBalance,
                currency,
              )}
            />
            <StatItem
              label="Shortfall"
              value={
                emergencyGap > 0
                  ? formatCurrency(emergencyGap, currency)
                  : "Fully funded"
              }
            />
            <StatItem
              label="Held at"
              value={detail.emergencyFund.storageLocation ?? "—"}
            />
            <StatItem
              label="Effective tax rate"
              value={`${detail.taxProfile?.effectiveTaxRatePct ?? 0}%`}
            />
          </StatGrid>
        </SectionPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionPanel
          title="Liabilities & property"
          variant="info"
          actions={
            canEdit ? (
              <div className="flex flex-wrap gap-2">
                <AddLiabilityDialog clientId={clientId} currency={currency} />
                <AddPropertyDialog clientId={clientId} currency={currency} />
              </div>
            ) : null
          }
        >
          {detail.liabilities.length === 0 &&
          detail.propertyAssets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No liabilities or property on file.
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {detail.liabilities.map((liability) => (
                <ListRow
                  key={liability.id}
                  title={
                    <span className="text-sm font-medium">{liability.name}</span>
                  }
                  meta={`${liability.lender} · ${liability.interestRatePct ?? 0}%`}
                  trailing={
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatCurrency(liability.balance, currency)}
                      </span>
                      {canEdit ? (
                        <RemoveProfileItemButton
                          clientId={clientId}
                          collection="liabilities"
                          itemId={liability.id}
                          label={liability.name}
                        />
                      ) : null}
                    </span>
                  }
                />
              ))}
              {detail.propertyAssets.map((property) => (
                <ListRow
                  key={property.property_id}
                  title={
                    <span className="text-sm font-medium">{property.name}</span>
                  }
                  meta={`${property.city}, ${property.country}`}
                  trailing={
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatCurrency(property.current_value ?? 0, currency)}
                      </span>
                      {canEdit ? (
                        <RemoveProfileItemButton
                          clientId={clientId}
                          collection="propertyAssets"
                          itemId={property.property_id}
                          label={property.name}
                        />
                      ) : null}
                    </span>
                  }
                />
              ))}
            </div>
          )}
        </SectionPanel>

        <SectionPanel
          title="Protection"
          actions={canEdit ? <AddInsuranceDialog clientId={clientId} /> : null}
        >
          {detail.insurancePolicies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No protection cover on record — worth raising at the next review.
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {detail.insurancePolicies.map((policy) => (
                <ListRow
                  key={policy.policy_id}
                  title={
                    <span className="text-sm font-medium">{policy.name}</span>
                  }
                  meta={`${policy.provider} · ${policy.category}`}
                  trailing={
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatCompactCurrency(policy.coverage_amount ?? 0)} cover
                      </span>
                      {canEdit ? (
                        <RemoveProfileItemButton
                          clientId={clientId}
                          collection="insurancePolicies"
                          itemId={policy.policy_id}
                          label={policy.name}
                        />
                      ) : null}
                    </span>
                  }
                />
              ))}
            </div>
          )}
        </SectionPanel>
      </div>
    </div>
  );
}
