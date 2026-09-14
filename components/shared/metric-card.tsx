import type { LucideIcon } from "lucide-react";

import { CelereyAiSymbol } from "@/components/brand/celerey-ai-symbol";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardTheme, type TintedSurfaceVariant } from "@/lib/dashboard-theme";
import { headingTitle } from "@/lib/format";
import { cn } from "@/lib/utils";

type MetricCardVariant = "default" | "accent" | TintedSurfaceVariant;

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  delta?: { value: string; positive: boolean };
  icon?: LucideIcon;
  symbol?: "celerey-ai";
  variant?: MetricCardVariant;
  /** Tighter card for secondary KPIs in dense grids. */
  compact?: boolean;
  className?: string;
};

const VARIANT_SURFACE: Record<MetricCardVariant, string> = {
  default: "",
  accent: dashboardTheme.tintedSurface.brand,
  brand: dashboardTheme.tintedSurface.brand,
  success: dashboardTheme.tintedSurface.success,
  warning: dashboardTheme.tintedSurface.warning,
  info: dashboardTheme.tintedSurface.info,
  ai: dashboardTheme.tintedSurface.ai,
  muted: dashboardTheme.tintedSurface.muted,
};

const VARIANT_ICON: Partial<Record<MetricCardVariant, string>> = {
  warning: "text-warning",
  success: "text-success",
  info: "text-accent-blue",
  ai: "text-accent-purple",
};

export function MetricCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  symbol,
  variant = "default",
  compact = false,
  className,
}: MetricCardProps) {
  const showTint = variant !== "default";
  const showIcon = !compact && Boolean(Icon || symbol);

  return (
    <Card
      size="sm"
      className={cn(
        dashboardTheme.kpiCard,
        "min-w-0",
        showTint && VARIANT_SURFACE[variant],
        className,
      )}
    >
      <CardContent className={cn(compact ? "space-y-1" : "space-y-2")}>
        <div className="flex min-w-0 items-center gap-2">
          {showIcon ? (
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-brand",
                VARIANT_ICON[variant] ?? "text-primary",
              )}
            >
              {symbol === "celerey-ai" ? (
                <CelereyAiSymbol size="sm" />
              ) : Icon ? (
                <Icon className="size-4 shrink-0" aria-hidden />
              ) : null}
            </div>
          ) : null}
          <p className={cn(dashboardTheme.statLabel, "min-w-0 leading-snug")}>
            {headingTitle(label)}
          </p>
        </div>
        <p
          className={cn(
            "font-medium tracking-tight tabular-nums text-foreground",
            compact ? "text-xl" : dashboardTheme.statValueLarge,
          )}
        >
          {value}
        </p>
        {delta || hint ? (
          <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] leading-snug text-muted-foreground">
            {delta ? (
              <span
                className={cn(
                  "font-medium",
                  delta.positive ? "text-success" : "text-destructive",
                )}
              >
                {delta.value}
              </span>
            ) : null}
            {hint ? <span className="min-w-0">{hint}</span> : null}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
