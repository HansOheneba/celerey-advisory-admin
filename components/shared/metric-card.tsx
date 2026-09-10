import type { LucideIcon } from "lucide-react";

import { CelereyAiSymbol } from "@/components/brand/celerey-ai-symbol";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardTheme, type TintedSurfaceVariant } from "@/lib/dashboard-theme";
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
}: MetricCardProps) {
  const showTint = variant !== "default";
  const showIcon = Boolean(Icon || symbol);

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
          <p className={dashboardTheme.statLabel}>{label}</p>
          {showIcon ? (
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-md bg-surface-brand",
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
        </div>
        <p className={dashboardTheme.statValueLarge}>{value}</p>
        {delta || hint ? (
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
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
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
