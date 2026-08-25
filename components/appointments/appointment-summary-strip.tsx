import type { ScheduleStats } from "@/lib/appointments/display";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

type AppointmentSummaryStripProps = {
  stats: ScheduleStats;
};

const ITEMS = [
  { key: "today", label: "Today", suffix: "sessions" },
  { key: "thisWeek", label: "This week", suffix: "sessions" },
  { key: "requests", label: "Requests", suffix: "awaiting" },
  { key: "completedThisMonth", label: "Completed", suffix: "this month" },
] as const;

export function AppointmentSummaryStrip({
  stats,
}: AppointmentSummaryStripProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {ITEMS.map((item) => (
        <div
          key={item.key}
          className={cn(dashboardTheme.card, "rounded-xl px-4 py-3")}
        >
          <p className={dashboardTheme.sectionLabel}>{item.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
            {stats[item.key]}
          </p>
          <p className="text-xs text-muted-foreground">{item.suffix}</p>
        </div>
      ))}
    </div>
  );
}
