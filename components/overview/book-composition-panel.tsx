import { PieChart } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatCompactCurrency } from "@/lib/format";
import type { BookSegmentRow } from "@/lib/overview/overview-helpers";
import { cn } from "@/lib/utils";

type BookCompositionPanelProps = {
  segments: BookSegmentRow[];
};

export function BookCompositionPanel({ segments }: BookCompositionPanelProps) {
  return (
    <section className={cn(dashboardTheme.elevatedSection, "space-y-4")}>
      <div className="space-y-1">
        <h2 className={dashboardTheme.sectionTitle}>Book composition</h2>
        <p className="text-sm text-muted-foreground">AUA by client segment.</p>
      </div>

      {segments.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title="No segment data"
          description="Client segments appear once relationships are assigned."
        />
      ) : (
        <div className="space-y-4">
          {segments.map((segment) => (
            <div key={segment.segment} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">
                  {segment.label}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({segment.clientCount})
                  </span>
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {segment.sharePct}% · {formatCompactCurrency(segment.aua)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(segment.sharePct, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
