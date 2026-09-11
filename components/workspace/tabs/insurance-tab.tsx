import {
  AddInsuranceDialog,
  EditInsurancePolicyDialog,
} from "@/components/clients/profile/profile-editors";
import { RemoveProfileItemButton } from "@/components/clients/profile/remove-profile-item-button";
import { ListRow } from "@/components/shared/list-row";
import { SectionPanel } from "@/components/shared/section-panel";
import { formatCompactCurrency, formatDate } from "@/lib/format";
import type { DemoClientRecord } from "@/lib/demo/types";

type InsuranceTabProps = {
  record: DemoClientRecord;
  canEdit: boolean;
};

export function InsuranceTab({ record, canEdit }: InsuranceTabProps) {
  const { client, detail } = record;
  const clientId = client.id;

  return (
    <SectionPanel
      title="Insurance policies"
      description="Life, health, and other policies. Home cover is under Properties."
      actions={canEdit ? <AddInsuranceDialog clientId={clientId} /> : null}
    >
      {detail.insurancePolicies.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No standalone policies on record.
        </p>
      ) : (
        <div className="divide-y divide-border/50">
          {detail.insurancePolicies.map((policy) => (
            <ListRow
              key={policy.policy_id}
              title={
                <span className="text-sm font-medium">{policy.name}</span>
              }
              meta={[
                policy.provider,
                policy.category,
                policy.renewal_date
                  ? `Renews ${formatDate(String(policy.renewal_date))}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
              trailing={
                <span className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatCompactCurrency(policy.coverage_amount ?? 0)} cover
                  </span>
                  {canEdit ? (
                    <>
                      <EditInsurancePolicyDialog
                        clientId={clientId}
                        policy={{
                          policy_id: policy.policy_id,
                          name: policy.name,
                          provider: policy.provider,
                          coverage_amount: policy.coverage_amount,
                          premium_monthly: policy.premium_monthly,
                          renewal_date: policy.renewal_date as string | undefined,
                        }}
                      />
                      <RemoveProfileItemButton
                        clientId={clientId}
                        collection="insurancePolicies"
                        itemId={policy.policy_id}
                        label={policy.name}
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
