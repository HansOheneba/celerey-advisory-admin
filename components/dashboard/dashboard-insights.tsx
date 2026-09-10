import { buildDashboardInsights } from "@/lib/dashboard-insights";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/client";

type DashboardInsightsProps = {
  summary: DashboardSummary;
};

const toneClass: Record<string, string> = {
  neutral: "border-border",
  attention: "border-amber-500/30 bg-amber-500/[0.04]",
  positive: "border-emerald-500/25 bg-emerald-500/[0.04]",
};

export function DashboardInsights({ summary }: DashboardInsightsProps) {
  const insights = buildDashboardInsights(summary);

  if (insights.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="space-y-0.5">
        <p className={dashboardTheme.sectionLabel}>Insights</p>
        <h3 className="text-base font-semibold tracking-tight">
          What needs attention
        </h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {insights.map((insight) => (
          <article
            key={insight.id}
            className={cn(
              "rounded-xl border bg-card p-4 shadow-none",
              toneClass[insight.tone],
            )}
          >
            <p className="text-sm font-medium tracking-tight">{insight.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {insight.detail}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
