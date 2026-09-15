"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { ToolClientSeed } from "@/components/tools/tools-view";
import { dashboardTheme } from "@/lib/dashboard-theme";
import {
  formatCompactCurrency,
  formatCurrency,
  headingTitle,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type ClientContextStripProps = {
  seed: ToolClientSeed;
  onSuggestTool?: (toolId: string) => void;
};

function ContextMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 border-l border-border/60 pl-3 first:border-l-0 first:pl-0">
      <p className={dashboardTheme.statLabel}>{headingTitle(label)}</p>
      <p className="truncate text-sm font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}

export function ClientContextStrip({
  seed,
  onSuggestTool,
}: ClientContextStripProps) {
  const cashDrift = seed.cashWeightingPct - seed.targetCashWeightingPct;
  const yearsToRetirement = Math.max(seed.retirementAge - seed.currentAge, 0);
  const portfolioValue = Number.isFinite(seed.portfolioValueUsd)
    ? seed.portfolioValueUsd
    : 0;

  return (
    <div className={cn(dashboardTheme.elevatedSection, "space-y-4")}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted text-sm font-semibold text-foreground">
            {seed.name
              .split(" ")
              .map((part) => part.charAt(0))
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-xs text-muted-foreground">
              {headingTitle("Profile snapshot")}
            </p>
            <p className="text-base font-semibold tracking-tight sm:text-lg">
              <Link
                href={`/clients/${seed.id}`}
                className="hover:text-primary hover:underline underline-offset-4"
              >
                {seed.name}
              </Link>
            </p>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-y-3 sm:flex sm:flex-wrap sm:items-end sm:gap-x-6 lg:justify-end">
          <ContextMetric
            label="Portfolio"
            value={formatCompactCurrency(portfolioValue, "USD")}
          />
          <ContextMetric
            label="Cash weighting"
            value={`${seed.cashWeightingPct.toFixed(1)}%`}
          />
          <ContextMetric
            label="Age → retirement"
            value={`${seed.currentAge} → ${seed.retirementAge}`}
          />
          <ContextMetric
            label="Years to retire"
            value={String(yearsToRetirement)}
          />
          <ContextMetric
            label="Monthly savings"
            value={formatCurrency(seed.monthlySavingsUsd, "USD")}
          />
        </div>
      </div>

      {cashDrift > 2 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Cash {cashDrift.toFixed(1)} pts over target.
          </p>
          {onSuggestTool ? (
            <button
              type="button"
              onClick={() => onSuggestTool("cash")}
              className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline-offset-4 hover:underline"
            >
              Cash deployment
              <ArrowUpRight className="size-3" aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
