import { DollarSign } from "lucide-react";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";

import { Card, CardContent } from "@/components/ui/card";
import {
  advisedOnlyAssets,
  ASSETS_UNDER_ADVISORY_LABEL,
} from "@/lib/clients/asset-relationship";
import type { BookScope } from "@/lib/auth/capabilities";
import { dashboardTheme } from "@/lib/dashboard-theme";
import {
  bookScopeEyebrow,
  formatBookAssetsManagedSubline,
} from "@/lib/overview/book-scope-copy";
import {
  formatCompactCurrency,
  formatPastTwelveMonthReturn,
  headingTitle,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type BookAssetsCardProps = {
  totalAua: number;
  totalAum: number;
  scope: BookScope;
  performancePct?: number;
  className?: string;
};

export function BookAssetsCard({
  totalAua,
  totalAum,
  scope,
  performancePct,
  className,
}: BookAssetsCardProps) {
  const heldAway = advisedOnlyAssets(totalAua, totalAum);

  return (
    <Card
      size="sm"
      className={cn(
        dashboardTheme.kpiCard,
        dashboardTheme.tintedSurface.info,
        "min-w-0",
        className,
      )}
    >
      <CardContent className="space-y-2">
        <SectionEyebrow>{bookScopeEyebrow(scope)}</SectionEyebrow>
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-brand text-accent-blue">
            <DollarSign className="size-4 shrink-0" aria-hidden />
          </div>
          <p className={cn(dashboardTheme.statLabel, "min-w-0 leading-snug")}>
            {headingTitle(ASSETS_UNDER_ADVISORY_LABEL)}
          </p>
        </div>
        <p className={dashboardTheme.statValueLarge}>
          {formatCompactCurrency(totalAua)}
        </p>
        <p className="text-sm leading-snug text-muted-foreground">
          {formatBookAssetsManagedSubline(totalAua, totalAum, scope)}
          {heldAway > 0 ? (
            <>
              {" "}
              {formatCompactCurrency(heldAway)} held away.
            </>
          ) : null}
        </p>
        {performancePct !== undefined ? (
          <p className="text-[11px] leading-snug text-muted-foreground">
            <span
              className={cn(
                "font-medium",
                performancePct >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {formatPastTwelveMonthReturn(performancePct, "managed")}
            </span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
