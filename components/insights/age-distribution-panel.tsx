import { Users } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionPanel } from "@/components/shared/section-panel";
import { StatGrid, StatItem } from "@/components/shared/stat-grid";
import { formatCompactCurrency } from "@/lib/format";
import type { AgeAnalytics } from "@/lib/overview/book-analytics";
import { cn } from "@/lib/utils";

type AgeDistributionPanelProps = {
  analytics: AgeAnalytics;
};

export function AgeDistributionPanel({ analytics }: AgeDistributionPanelProps) {
  const maxCount = Math.max(...analytics.buckets.map((bucket) => bucket.count), 1);

  if (analytics.withAgeCount === 0) {
    return (
      <SectionPanel
        title="Age distribution"
        description="Client ages across the book."
        variant="info"
      >
        <EmptyState
          icon={Users}
          title="No age data available"
          description="Date of birth or retirement age is needed to show demographics."
        />
      </SectionPanel>
    );
  }

  return (
    <SectionPanel
      title="Age distribution"
      description={`${analytics.withAgeCount} clients with known age`}
      variant="info"
    >
      <StatGrid columns={4} className="mb-4">
        <StatItem label="Average" value={`${analytics.averageAge} yrs`} />
        <StatItem label="Median" value={`${analytics.medianAge} yrs`} />
        <StatItem label="Youngest" value={`${analytics.youngest} yrs`} />
        <StatItem label="Oldest" value={`${analytics.oldest} yrs`} />
      </StatGrid>

      <div className="space-y-3">
        {analytics.buckets.map((bucket) => (
          <div key={bucket.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{bucket.label}</span>
              <span className="text-right text-muted-foreground tabular-nums">
                {bucket.count} · {formatCompactCurrency(bucket.totalCovered)}
                <span className="block text-[10px]">
                  AUA {formatCompactCurrency(bucket.aua)} · AUM{" "}
                  {formatCompactCurrency(bucket.aum)}
                </span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full bg-primary/70 transition-all",
                  bucket.count === 0 && "bg-transparent",
                )}
                style={{
                  width: `${(bucket.count / maxCount) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}
