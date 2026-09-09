"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type FormCheckboxProps = {
  name: string;
  id: string;
  label: string;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function FormCheckbox({
  name,
  id,
  label,
  defaultChecked = false,
  onCheckedChange,
}: FormCheckboxProps) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center gap-2">
      <input type="hidden" name={name} value={checked ? "true" : "false"} />
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(next) => {
          const value = Boolean(next);
          setChecked(value);
          onCheckedChange?.(value);
        }}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}
