"use client";

import {
  advisedOnlyAssets,
  ASSETS_UNDER_ADVISORY_LABEL,
} from "@/lib/clients/asset-relationship";
import type { BookScope } from "@/lib/auth/capabilities";
import { formatBookAssetsManagedSubline } from "@/lib/overview/book-scope-copy";
import { SectionPanel } from "@/components/shared/section-panel";
import { StatGrid, StatItem } from "@/components/shared/stat-grid";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatCompactCurrency } from "@/lib/format";
import type { DemoClientRecord } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

type AuaAumPanelProps = {
  totalAua: number;
  totalAum: number;
  records: DemoClientRecord[];
  scope: BookScope;
};

function countByMandate(records: DemoClientRecord[]) {
  let adviseOnly = 0;
  let managed = 0;

  for (const record of records) {
    if (record.client.aum > 0) {
      managed += 1;
    } else if (record.client.aua > 0) {
      adviseOnly += 1;
    }
  }

  return { adviseOnly, managed };
}

export function AuaAumPanel({
  totalAua,
  totalAum,
  records,
  scope,
}: AuaAumPanelProps) {
  const advisedOnlyTotal = advisedOnlyAssets(totalAua, totalAum);
  const aumShare =
    totalAua > 0 ? Math.round((totalAum / totalAua) * 1000) / 10 : 0;
  const advisedOnlyShare =
    totalAua > 0
      ? Math.round((advisedOnlyTotal / totalAua) * 1000) / 10
      : 0;
  const mandateCounts = countByMandate(records);

  return (
    <SectionPanel
      title="AUA vs AUM"
      description="AUM sits inside AUA. Held-away assets count toward advisory, not management."
    >
      <div className="space-y-5">
        <div>
          <p className={dashboardTheme.statLabel}>
            {ASSETS_UNDER_ADVISORY_LABEL}
          </p>
          <p className="text-2xl font-medium tabular-nums tracking-tight">
            {formatCompactCurrency(totalAua)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatBookAssetsManagedSubline(totalAua, totalAum, scope)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {records.length} relationships
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
            {aumShare > 0 ? (
              <div
                className="h-full bg-primary"
                style={{ width: `${aumShare}%` }}
                title={`AUM ${aumShare}%`}
              />
            ) : null}
            {advisedOnlyShare > 0 ? (
              <div
                className={cn("h-full bg-foreground/25")}
                style={{ width: `${advisedOnlyShare}%` }}
                title={`Held away ${advisedOnlyShare}%`}
              />
            ) : null}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" aria-hidden />
              Managed {formatCompactCurrency(totalAum)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-foreground/25" aria-hidden />
              Held away {formatCompactCurrency(advisedOnlyTotal)}
            </span>
          </div>
        </div>

        <StatGrid columns={2}>
          <StatItem label="Managed" value={mandateCounts.managed} />
          <StatItem label="Advise only" value={mandateCounts.adviseOnly} />
        </StatGrid>
      </div>
    </SectionPanel>
  );
}
