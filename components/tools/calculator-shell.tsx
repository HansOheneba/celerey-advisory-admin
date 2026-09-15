"use client";

import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";

import { StatGrid, StatItem } from "@/components/shared/stat-grid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseMoneyInput } from "@/lib/clients/property-form";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatNumberWithCommas, headingTitle } from "@/lib/format";
import { cn } from "@/lib/utils";

function fieldId(label: string) {
  return label.toLowerCase().replace(/[^a-z]+/g, "-");
}

function formatMoneyDisplay(value: number): string {
  if (!Number.isFinite(value)) {
    return "";
  }
  if (value === 0) {
    return "0";
  }
  return formatNumberWithCommas(String(value));
}

export function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const id = fieldId(label);
  const [display, setDisplay] = useState(() => formatMoneyDisplay(value));

  useEffect(() => {
    setDisplay(formatMoneyDisplay(value));
  }, [value]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {headingTitle(label)}
      </Label>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={(event) => {
          const formatted = formatNumberWithCommas(event.target.value);
          setDisplay(formatted);
          onChange(parseMoneyInput(formatted));
        }}
        className="bg-background tabular-nums"
      />
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  const id = fieldId(label);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {headingTitle(label)}
      </Label>
      <Input
        id={id}
        type="number"
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="bg-background"
      />
    </div>
  );
}

export function CalculatorCard({
  title,
  description,
  icon: Icon,
  inputs,
  primaryResult,
  secondaryResults,
  talkingPoint,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  variant?: "brand" | "info" | "success" | "warning";
  inputs: React.ReactNode;
  primaryResult: { label: string; value: string; tone?: "neutral" | "good" | "bad" };
  secondaryResults: Array<{
    label: string;
    value: string;
    tone?: "neutral" | "good" | "bad";
  }>;
  talkingPoint?: string;
}) {
  return (
    <article className={cn(dashboardTheme.elevatedSection, "space-y-6")}>
      <header className="flex items-start gap-3 border-b border-border pb-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground">
          <Icon className="size-[18px]" aria-hidden />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight">
            {headingTitle(title)}
          </h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <SectionEyebrow>Inputs</SectionEyebrow>
          <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-2">
            {inputs}
          </div>
        </div>

        <div className="space-y-4">
          <SectionEyebrow>Results</SectionEyebrow>

          <div className="rounded-lg border border-border/60 bg-card px-5 py-5">
            <p className={dashboardTheme.statLabel}>
              {headingTitle(primaryResult.label)}
            </p>
            <p
              className={cn(
                "mt-1 text-3xl font-semibold tabular-nums tracking-tight",
                primaryResult.tone === "good" && "text-success",
                primaryResult.tone === "bad" && "text-destructive",
              )}
            >
              {primaryResult.value}
            </p>
          </div>

          {talkingPoint ? (
            <div className="rounded-lg border border-border border-l-[3px] border-l-foreground/20 bg-muted/25 px-4 py-3.5">
              <SectionEyebrow>Talking point</SectionEyebrow>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                {talkingPoint}
              </p>
            </div>
          ) : null}

          <StatGrid columns={2}>
            {secondaryResults.map((result) => (
              <StatItem
                key={result.label}
                label={result.label}
                value={
                  <span
                    className={cn(
                      "font-medium tabular-nums",
                      result.tone === "good" && "text-success",
                      result.tone === "bad" && "text-destructive",
                    )}
                  >
                    {result.value}
                  </span>
                }
              />
            ))}
          </StatGrid>
        </div>
      </div>
    </article>
  );
}
