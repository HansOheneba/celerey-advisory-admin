import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardTheme } from "@/lib/dashboard-theme";

export function DashboardSkeleton() {
  return (
    <div className={dashboardTheme.page}>
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className={dashboardTheme.kpiCard}>
            <CardHeader>
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className={dashboardTheme.card}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-56 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className={dashboardTheme.card}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((__, row) => (
                <div key={row} className="flex items-center justify-between">
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
