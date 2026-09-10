import { dashboardTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

type StatGridProps = {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 6;
  className?: string;
};

const COLUMN_CLASSES = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
} as const;

export function StatGrid({
  children,
  columns = 4,
  className,
}: StatGridProps) {
  return (
    <div className={cn("grid gap-4", COLUMN_CLASSES[columns], className)}>
      {children}
    </div>
  );
}

type StatItemProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  large?: boolean;
  className?: string;
};

export function StatItem({
  label,
  value,
  hint,
  large = false,
  className,
}: StatItemProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className={dashboardTheme.statLabel}>{label}</p>
      <p className={large ? dashboardTheme.statValueLarge : dashboardTheme.statValue}>
        {value}
      </p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
