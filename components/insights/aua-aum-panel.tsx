"use client";

import { deriveRelationshipKind } from "@/lib/clients/asset-relationship";
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
  let auaOnly = 0;
  let aumOnly = 0;
  let both = 0;

  for (const record of records) {
    const kind = deriveRelationshipKind(record.client.aua, record.client.aum);
    if (kind === "aua+aum") {
      both += 1;
    } else if (kind === "aum") {
      aumOnly += 1;
    } else if (kind === "aua") {
      auaOnly += 1;
    }
  }

  return { auaOnly, aumOnly, both };
}

export function AuaAumPanel({ totalAua, totalAum, records }: AuaAumPanelProps) {
  const totalCovered = totalAua + totalAum;
  const auaShare =
    totalCovered > 0 ? Math.round((totalAua / totalCovered) * 1000) / 10 : 0;
  const aumShare =
    totalCovered > 0 ? Math.round((totalAum / totalCovered) * 1000) / 10 : 0;
  const mandateCounts = countByMandate(records);

  return (
    <SectionPanel
      title="AUA vs AUM"
      description="How assets split between advised and managed mandates."
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className={dashboardTheme.statLabel}>Assets under advice</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {formatCompactCurrency(totalAua)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{auaShare}% of book</p>
          </div>
          <div>
            <p className={dashboardTheme.statLabel}>Assets under management</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {formatCompactCurrency(totalAum)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{aumShare}% of book</p>
          </div>
          <div>
            <p className={dashboardTheme.statLabel}>Total covered</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {formatCompactCurrency(totalCovered)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {records.length} relationships
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
            {auaShare > 0 ? (
              <div
                className={cn("h-full bg-foreground/25")}
                style={{ width: `${auaShare}%` }}
                title={`AUA ${auaShare}%`}
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
              AUA {formatCompactCurrency(totalAua)}
            </span>
          </div>
        </div>

        <StatGrid columns={3}>
          <StatItem label="AUM only" value={mandateCounts.aumOnly} />
          <StatItem label="AUA only" value={mandateCounts.auaOnly} />
          <StatItem label="AUA + AUM" value={mandateCounts.both} />
        </StatGrid>
      </div>
    </SectionPanel>
  );
}
