import { buildDashboardInsights } from "@/lib/dashboard-insights";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/client";

type DashboardInsightsProps = {
  summary: DashboardSummary;
};

const toneClass: Record<string, string> = {
  neutral: "border-border",
  attention: "border-warning/30 bg-surface-warning",
  positive: "border-success/25 bg-surface-success",
};

export function DashboardInsights({ summary }: DashboardInsightsProps) {
  const insights = buildDashboardInsights(summary);

  if (insights.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="space-y-0.5">
        <SectionEyebrow>Insights</SectionEyebrow>
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
