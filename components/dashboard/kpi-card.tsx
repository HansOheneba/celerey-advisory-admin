import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dashboardTheme } from "@/lib/dashboard-theme";

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
        <CardTitle className={dashboardTheme.sectionLabel}>{label}</CardTitle>
        {icon ? (
          <div className="rounded-md bg-primary/5 p-1.5 text-primary">{icon}</div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
