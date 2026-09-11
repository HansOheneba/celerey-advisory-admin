import { EditRetirementDialog } from "@/components/clients/profile/profile-editors";
import { SectionPanel } from "@/components/shared/section-panel";
import { StatGrid, StatItem } from "@/components/shared/stat-grid";
import { RETIREMENT_STORAGE_OPTIONS } from "@/lib/clients/creation-options";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { DemoClientRecord } from "@/lib/demo/types";

type RetirementTabProps = {
  record: DemoClientRecord;
  canEdit: boolean;
};

export function RetirementTab({ record, canEdit }: RetirementTabProps) {
  const { client, detail } = record;
  const currency = client.currency;
  const clientId = client.id;
  const storageLabel =
    RETIREMENT_STORAGE_OPTIONS.find(
      (option) => option.value === detail.retirement.storageLocation,
    )?.label ?? detail.retirement.storageLocation ?? "—";
  const projections = detail.retirementProjections as
    | {
        projectedBalanceAtRetirement?: number;
        onTrack?: boolean;
        shortfallMonthly?: number;
      }
    | undefined;

  return (
    <div className="space-y-4">
      <SectionPanel
        title="Retirement plan"
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
            value={formatCurrency(detail.retirement.monthlySavings, currency)}
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
          <StatItem label="Held in" value={storageLabel} />
        </StatGrid>
      </SectionPanel>

      {projections ? (
        <SectionPanel
          title="Projections"
          description="From the numbers above. Read-only."
        >
          <StatGrid columns={3}>
            <StatItem
              label="Balance at retirement"
              value={formatCompactCurrency(
                projections.projectedBalanceAtRetirement ?? 0,
              )}
            />
            <StatItem
              label="On track"
              value={projections.onTrack ? "Yes" : "Behind plan"}
            />
            <StatItem
              label="Monthly shortfall"
              value={
                projections.shortfallMonthly
                  ? formatCurrency(projections.shortfallMonthly, currency)
                  : "None"
              }
            />
          </StatGrid>
        </SectionPanel>
      ) : null}
    </div>
  );
}
