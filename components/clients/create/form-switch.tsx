"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type FormSwitchProps = {
  name: string;
  id: string;
  fieldLabel: string;
  description?: string;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function FormSwitch({
  name,
  id,
  fieldLabel,
  description,
  defaultChecked = false,
  onCheckedChange,
}: FormSwitchProps) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{fieldLabel}</Label>
      <div className="flex items-center gap-3 pt-1">
        <input type="hidden" name={name} value={checked ? "true" : "false"} />
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={(next) => {
            const value = Boolean(next);
            setChecked(value);
            onCheckedChange?.(value);
          }}
        />
        <span className="text-sm">{checked ? "Yes" : "No"}</span>
      </div>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
