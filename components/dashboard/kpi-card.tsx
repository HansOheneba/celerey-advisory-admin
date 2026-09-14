import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { headingTitle } from "@/lib/format";

type KpiCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
};

export function KpiCard({ label, value, hint, icon, className }: KpiCardProps) {
  return (
    <Card className={cn(dashboardTheme.kpiCard, className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className={dashboardTheme.statLabel}>
          {headingTitle(label)}
        </CardTitle>
        {icon ? (
          <div className="flex size-10 items-center justify-center rounded-md bg-surface-brand text-primary">
            {icon}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-1">
        <p className={dashboardTheme.statValueLarge}>{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
