"use client";

import {
  advisedOnlyAssets,
  deriveRelationshipKind,
} from "@/lib/clients/asset-relationship";
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
};

function countByMandate(records: DemoClientRecord[]) {
  let advisedOnly = 0;
  let managedOnly = 0;
  let mixed = 0;

  for (const record of records) {
    const kind = deriveRelationshipKind(record.client.aua, record.client.aum);
    if (kind === "aua+aum") {
      mixed += 1;
    } else if (kind === "aum") {
      managedOnly += 1;
    } else if (kind === "aua") {
      advisedOnly += 1;
    }
  }

  return { advisedOnly, managedOnly, mixed };
}

export function AuaAumPanel({ totalAua, totalAum, records }: AuaAumPanelProps) {
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
      description="AUM is a subset of AUA — advised-only assets are held away from Celerey management."
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className={dashboardTheme.statLabel}>Assets under advice</p>
            <p className="text-2xl font-medium tabular-nums tracking-tight">
              {formatCompactCurrency(totalAua)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {records.length} relationships
            </p>
          </div>
          <div>
            <p className={dashboardTheme.statLabel}>Assets under management</p>
            <p className="text-2xl font-medium tabular-nums tracking-tight">
              {formatCompactCurrency(totalAum)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {aumShare}% of AUA
            </p>
          </div>
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
                title={`Advised only ${advisedOnlyShare}%`}
              />
            ) : null}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" aria-hidden />
              AUM {formatCompactCurrency(totalAum)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-foreground/25" aria-hidden />
              Advised only {formatCompactCurrency(advisedOnlyTotal)}
            </span>
          </div>
        </div>

        <StatGrid columns={3}>
          <StatItem label="Managed only" value={mandateCounts.managedOnly} />
          <StatItem label="Advised only" value={mandateCounts.advisedOnly} />
          <StatItem label="Mixed mandate" value={mandateCounts.mixed} />
        </StatGrid>
      </div>
    </SectionPanel>
  );
}
