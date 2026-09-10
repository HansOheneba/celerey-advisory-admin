import Link from "next/link";

import type { ScheduleStats } from "@/lib/appointments/display";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

type AppointmentSummaryStripProps = {
  stats: ScheduleStats;
  sessionsHref?: string;
};

const ITEMS = [
  { key: "today", label: "Today", suffix: "sessions" },
  { key: "thisWeek", label: "This week", suffix: "sessions" },
  { key: "requests", label: "Requests", suffix: "awaiting" },
  { key: "completedThisMonth", label: "Completed", suffix: "this month" },
] as const;

export function AppointmentSummaryStrip({
  stats,
  sessionsHref,
}: AppointmentSummaryStripProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/50 bg-card">
      <div className="grid grid-cols-2 divide-x divide-y divide-border/50 sm:grid-cols-4 sm:divide-y-0">
        {ITEMS.map((item) => {
          const isRequests = item.key === "requests";
          const isCompleted = item.key === "completedThisMonth";
          const interactive =
            isCompleted && sessionsHref && stats[item.key] > 0;
          const hasRequests = isRequests && stats.requests > 0;

          const content = (
            <>
              <p className={dashboardTheme.sectionLabel}>{item.label}</p>
              <p
                className={cn(
                  "mt-1 text-2xl font-semibold tabular-nums tracking-tight",
                  hasRequests && "text-foreground",
                )}
              >
                {stats[item.key]}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-xs text-muted-foreground",
                  interactive && "font-medium text-primary",
                )}
              >
                {interactive ? "View in Sessions" : item.suffix}
              </p>
            </>
          );

          const cellClassName = cn(
            "px-4 py-3 sm:px-5 sm:py-3.5",
            hasRequests && "bg-surface-warning/40",
            interactive && "transition-colors hover:bg-muted/30",
          );

          if (interactive) {
            return (
              <Link
                key={item.key}
                href={sessionsHref}
                className={cellClassName}
              >
                {content}
              </Link>
            );
          }

          return (
            <div key={item.key} className={cellClassName}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
