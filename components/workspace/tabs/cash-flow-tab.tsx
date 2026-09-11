import { ClientCashFlowChart } from "@/components/clients/detail/client-cash-flow-chart";
import {
  AddExpenseDialog,
  AddIncomeDialog,
  EditEmergencyFundDialog,
  EditExpenseDialog,
  EditIncomeDialog,
} from "@/components/clients/profile/profile-editors";
import { RemoveProfileItemButton } from "@/components/clients/profile/remove-profile-item-button";
import { ListRow } from "@/components/shared/list-row";
import { SectionPanel } from "@/components/shared/section-panel";
import { StatGrid, StatItem } from "@/components/shared/stat-grid";
import { formatCurrency } from "@/lib/format";
import type { DemoClientRecord } from "@/lib/demo/types";

type CashFlowTabProps = {
  record: DemoClientRecord;
  canEdit: boolean;
};

export function CashFlowTab({ record, canEdit }: CashFlowTabProps) {
  const { client, detail } = record;
  const currency = client.currency;
  const clientId = client.id;
  const emergencyMonths =
    detail.emergencyFund.computed?.runwayMonths ??
    detail.emergencyFund.computed?.monthsCovered ??
    0;
  const emergencyShortfall = Number(
    detail.emergencyFund.computed?.shortfall ??
      detail.emergencyFund.computed?.gap ??
      0,
  );

  return (
    <div className="space-y-4">
      <StatGrid columns={4}>
        <StatItem
          label="Monthly income"
          value={formatCurrency(detail.cashFlowSummary.monthly_income, currency)}
        />
        <StatItem
          label="Monthly expenses"
          value={formatCurrency(
            detail.cashFlowSummary.monthly_expenses,
            currency,
          )}
        />
        <StatItem
          label="Surplus"
          value={formatCurrency(
            detail.cashFlowSummary.monthly_surplus,
            currency,
          )}
        />
        <StatItem
          label="Savings rate"
          value={`${detail.cashFlowSummary.savings_rate_pct}%`}
        />
      </StatGrid>

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
        <SectionPanel title="Income" description="Monthly inflows.">
          {detail.incomeRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No income on file.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {detail.incomeRows.map((row) => (
                <ListRow
                  key={row.id}
                  title={<span className="text-sm font-medium">{row.name}</span>}
                  meta={`${formatCurrency(row.amount, currency)}/mo`}
                  trailing={
                    canEdit ? (
                      <span className="flex items-center gap-1">
                        <EditIncomeDialog
                          clientId={clientId}
                          row={{ id: row.id, name: row.name, amount: row.amount }}
                        />
                        <RemoveProfileItemButton
                          clientId={clientId}
                          collection="incomeRows"
                          itemId={row.id}
                          label={row.name}
                        />
                      </span>
                    ) : null
                  }
                />
              ))}
            </div>
          )}
        </SectionPanel>

        <SectionPanel title="Expenses" description="Monthly outflows.">
          {detail.expenseCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses on file.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {detail.expenseCategories.map((row) => (
                <ListRow
                  key={row.id}
                  title={<span className="text-sm font-medium">{row.name}</span>}
                  meta={`${formatCurrency(row.amount, currency)}/mo`}
                  trailing={
                    canEdit ? (
                      <span className="flex items-center gap-1">
                        <EditExpenseDialog
                          clientId={clientId}
                          row={{
                            id: row.id,
                            name: row.name,
                            amount: row.amount,
                            essential: row.essential,
                          }}
                        />
                        <RemoveProfileItemButton
                          clientId={clientId}
                          collection="expenseCategories"
                          itemId={row.id}
                          label={row.name}
                        />
                      </span>
                    ) : null
                  }
                />
              ))}
            </div>
          )}
        </SectionPanel>
      </div>

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
              emergencyShortfall > 0
                ? formatCurrency(emergencyShortfall, currency)
                : "Fully funded"
            }
          />
          <StatItem
            label="Held at"
            value={detail.emergencyFund.storageLocation ?? "—"}
          />
          <StatItem
            label="Target months"
            value={String(detail.emergencyFund.targetMonths)}
          />
        </StatGrid>
      </SectionPanel>
    </div>
  );
}
