import {
  AddLiabilityDialog,
  EditLiabilityDialog,
} from "@/components/clients/profile/profile-editors";
import { RemoveProfileItemButton } from "@/components/clients/profile/remove-profile-item-button";
import { ListRow } from "@/components/shared/list-row";
import { SectionPanel } from "@/components/shared/section-panel";
import { formatCurrency } from "@/lib/format";
import type { DemoClientRecord } from "@/lib/demo/types";

type LiabilitiesTabProps = {
  record: DemoClientRecord;
  canEdit: boolean;
};

export function LiabilitiesTab({ record, canEdit }: LiabilitiesTabProps) {
  const { client, detail } = record;
  const currency = client.currency;
  const clientId = client.id;
  const standalone = detail.liabilities.filter(
    (liability) => liability.type !== "mortgage",
  );

  return (
    <SectionPanel
      title="Liabilities"
      description="Loans and credit lines. Mortgages are on Properties."
      variant="info"
      actions={
        canEdit ? (
          <AddLiabilityDialog clientId={clientId} currency={currency} />
        ) : null
      }
    >
      {standalone.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No standalone liabilities on file.
        </p>
      ) : (
        <div className="divide-y divide-border/50">
          {standalone.map((liability) => (
            <ListRow
              key={liability.id}
              title={
                <span className="text-sm font-medium">{liability.name}</span>
              }
              meta={`${liability.lender} · ${liability.type} · ${liability.interestRatePct ?? 0}%`}
              trailing={
                <span className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatCurrency(liability.balance, currency)}
                  </span>
                  {canEdit ? (
                    <>
                      <EditLiabilityDialog
                        clientId={clientId}
                        currency={currency}
                        liability={{
                          id: liability.id,
                          name: liability.name,
                          balance: liability.balance,
                          minPaymentMonthly: liability.minPaymentMonthly,
                        }}
                      />
                      <RemoveProfileItemButton
                        clientId={clientId}
                        collection="liabilities"
                        itemId={liability.id}
                        label={liability.name}
                      />
                    </>
                  ) : null}
                </span>
              }
            />
          ))}
        </div>
      )}
    </SectionPanel>
  );
}
