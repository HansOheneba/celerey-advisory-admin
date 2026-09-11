import {
  AddPropertyDialog,
  EditPropertyDialog,
} from "@/components/clients/profile/profile-editors";
import { RemoveProfileItemButton } from "@/components/clients/profile/remove-profile-item-button";
import { SectionPanel } from "@/components/shared/section-panel";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { DemoClientRecord } from "@/lib/demo/types";

type PropertiesTabProps = {
  record: DemoClientRecord;
  canEdit: boolean;
};

export function PropertiesTab({ record, canEdit }: PropertiesTabProps) {
  const { client, detail } = record;
  const currency = client.currency;
  const clientId = client.id;

  return (
    <div className="space-y-4">
      <SectionPanel
        title="Properties"
        description="Homes and land. Mortgages and home insurance live on each property."
        variant="info"
        actions={
          canEdit ? (
            <AddPropertyDialog clientId={clientId} currency={currency} />
          ) : null
        }
      >
        {detail.propertyAssets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No properties on file.</p>
        ) : (
          <div className="space-y-4">
            {detail.propertyAssets.map((property) => {
              const value =
                Number(property.market_value) ||
                Number(property.current_value) ||
                Number(property.purchase_price) ||
                0;
              const mortgage = property.mortgage as
                | {
                    lender?: string;
                    balance?: number;
                    interest_rate_pct?: number;
                    min_payment_monthly?: number;
                  }
                | undefined;
              const insurance = property.insurance as
                | Array<{ type?: string; provider?: string; expiry_date?: string }>
                | undefined;

              return (
                <article
                  key={property.property_id}
                  className="rounded-lg border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium">{property.name}</h3>
                        {property.is_primary ? (
                          <Badge variant="secondary">Primary</Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {property.city}, {property.country} ·{" "}
                        {property.property_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatCurrency(value, currency)}
                      </span>
                      {canEdit ? (
                        <>
                          <EditPropertyDialog
                            clientId={clientId}
                            property={{
                              property_id: property.property_id,
                              name: property.name,
                              market_value: Number(property.market_value),
                              current_value: Number(property.current_value),
                            }}
                          />
                          <RemoveProfileItemButton
                            clientId={clientId}
                            collection="propertyAssets"
                            itemId={property.property_id}
                            label={property.name}
                          />
                        </>
                      ) : null}
                    </div>
                  </div>

                  {mortgage?.balance ? (
                    <div className="mt-3 rounded-md border border-border/50 bg-background/60 px-3 py-2 text-sm">
                      <p className="font-medium">Mortgage</p>
                      <p className="text-muted-foreground">
                        {mortgage.lender ?? "Lender"} ·{" "}
                        {formatCurrency(mortgage.balance, currency)} outstanding
                        {mortgage.interest_rate_pct
                          ? ` · ${mortgage.interest_rate_pct}%`
                          : ""}
                        {mortgage.min_payment_monthly
                          ? ` · ${formatCurrency(mortgage.min_payment_monthly, currency)}/mo`
                          : ""}
                      </p>
                    </div>
                  ) : null}

                  {insurance && insurance.length > 0 ? (
                    <div className="mt-2 space-y-1">
                      {insurance.map((policy, index) => (
                        <p
                          key={`${property.property_id}-ins-${index}`}
                          className="text-xs text-muted-foreground"
                        >
                          {policy.type ?? "Insurance"} · {policy.provider ?? "—"}
                          {policy.expiry_date
                            ? ` · expires ${policy.expiry_date}`
                            : ""}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </SectionPanel>
    </div>
  );
}
