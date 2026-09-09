"use client";

import { PropertyFormBody } from "@/components/clients/create/property-form-body";

type PropertyFieldsProps = {
  index: number;
  nameFor: (key: string) => string;
  idFor: (key: string) => string;
  currency?: string;
};

function insuranceFieldName(
  propertyIndex: number,
  insuranceIndex: number,
  key: string,
) {
  return `properties[${propertyIndex}].insurance[${insuranceIndex}].${key}`;
}

export function PropertyFields({
  index,
  nameFor,
  idFor,
  currency = "USD",
}: PropertyFieldsProps) {
  return (
    <PropertyFormBody
      nameFor={nameFor}
      idFor={idFor}
      insuranceNameFor={(insuranceIndex, key) =>
        insuranceFieldName(index, insuranceIndex, key)
      }
      currency={currency}
    />
  );
}
