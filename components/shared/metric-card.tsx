import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { dashboardTheme, type TintedSurfaceVariant } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

type MetricCardVariant = "default" | "accent" | TintedSurfaceVariant;

type MetricCardProps = {
  label: string;
  value: string;
  /** Short supporting line, e.g. "vs. last quarter". */
  hint?: string;
  /** Signed change rendered in green or red. */
  delta?: { value: string; positive: boolean };
  icon?: LucideIcon;
  variant?: MetricCardVariant;
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

export function MetricCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  variant = "default",
}: MetricCardProps) {
  const showTint = variant !== "default";

  return (
    <Card
      size="sm"
      className={cn(
        dashboardTheme.kpiCard,
        showTint && VARIANT_SURFACE[variant],
      )}
    >
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className={dashboardTheme.sectionLabel}>{label}</p>
          {Icon ? (
            <Icon
              className={cn(
                "size-4 shrink-0 text-muted-foreground",
                variant === "warning" && "text-amber-600",
                variant === "success" && "text-emerald-600",
                !showTint && "text-primary/70",
              )}
              aria-hidden
            />
          ) : null}
        </div>
        <p className="text-2xl font-semibold tabular-nums tracking-tight">
          {value}
        </p>
        {delta || hint ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {delta ? (
              <span
                className={cn(
                  "font-medium",
                  delta.positive ? "text-emerald-600" : "text-destructive",
                )}
              >
                {delta.value}
              </span>
            ) : null}
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
