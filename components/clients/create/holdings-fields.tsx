"use client";

import { AssetHoldingFields } from "@/components/clients/create/asset-holding-fields";
import { CreateFormSection } from "@/components/clients/create/create-form-section";
import { HoldingSymbolRegistry } from "@/components/clients/create/holding-symbol-registry";
import { PropertyFields } from "@/components/clients/create/property-fields";
import { RepeatableList } from "@/components/clients/create/repeatable-list";
import {
  indexedFieldName,
  useRepeatableKeys,
} from "@/components/clients/create/use-repeatable-keys";

type HoldingsFieldsProps = {
  currency?: string;
};

export function HoldingsFields({ currency = "USD" }: HoldingsFieldsProps) {
  const assets = useRepeatableKeys(1);
  const properties = useRepeatableKeys(0);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <CreateFormSection
        id="assets"
        title="Investment holdings"
        description="Match client dashboard rules: market types need symbol and quantity; stocks need current value (no live feed); mapped crypto can show live prices."
      >
        <HoldingSymbolRegistry>
          <RepeatableList
            items={assets.keys}
            onAdd={assets.add}
            onRemove={assets.remove}
            addLabel="Add holding"
            minItems={0}
            renderItem={(index) => (
              <AssetHoldingFields
                nameFor={(key) => indexedFieldName("assets", index, key)}
                idFor={(key) => `asset-${key}-${index}`}
                defaultAssetType={index === 0 ? "stock" : "cash"}
                initialValueDate={today}
              />
            )}
          />
        </HoldingSymbolRegistry>
      </CreateFormSection>

      <CreateFormSection
        id="properties"
        title="Properties"
        description="Each property can include a nested mortgage and property-tied insurance policies."
      >
        <RepeatableList
          items={properties.keys}
          onAdd={properties.add}
          onRemove={properties.remove}
          addLabel="Add property"
          minItems={0}
          renderItem={(index) => (
            <PropertyFields
              index={index}
              nameFor={(key) => indexedFieldName("properties", index, key)}
              idFor={(key) => `property-${key}-${index}`}
              currency={currency}
            />
          )}
        />
      </CreateFormSection>
    </div>
  );
}
