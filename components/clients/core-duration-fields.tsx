"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CORE_DURATION_PRESETS,
  DEFAULT_CORE_DURATION_DAYS,
  DEFAULT_CORE_DURATION_PRESET_KEY,
  type CoreDurationPresetKey,
} from "@/lib/definitions";

type CoreDurationFieldsProps = {
  error?: string;
};

export function CoreDurationFields({ error }: CoreDurationFieldsProps) {
  const [durationPreset, setDurationPreset] = useState<CoreDurationPresetKey>(
    DEFAULT_CORE_DURATION_PRESET_KEY,
  );
  const [customDays, setCustomDays] = useState(DEFAULT_CORE_DURATION_DAYS);
  const isCustomDuration = durationPreset === "custom";
  const durationDays = isCustomDuration
    ? customDays
    : String(
        CORE_DURATION_PRESETS.find((preset) => preset.key === durationPreset)
          ?.days ?? DEFAULT_CORE_DURATION_DAYS,
      );

  return (
    <div className="space-y-2">
      <Label htmlFor="durationPreset">Core subscription length</Label>
      <Select
        value={durationPreset}
        onValueChange={(next) =>
          setDurationPreset((next as CoreDurationPresetKey) ?? durationPreset)
        }
      >
        <SelectTrigger id="durationPreset" className="w-full">
          <SelectValue>
            {(value: CoreDurationPresetKey | null) =>
              CORE_DURATION_PRESETS.find((preset) => preset.key === value)
                ?.label ?? "Select duration"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {CORE_DURATION_PRESETS.map((preset) => (
            <SelectItem key={preset.key} value={preset.key}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isCustomDuration ? (
        <div className="space-y-1">
          <Label htmlFor="customDuration">Duration (days)</Label>
          <Input
            id="customDuration"
            type="number"
            min={1}
            max={3650}
            value={customDays}
            onChange={(event) => setCustomDays(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <input type="hidden" name="duration" value={durationDays} />
    </div>
  );
}
