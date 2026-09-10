import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

type PageSkeletonProps = {
  className?: string;
  kpiCount?: number;
  sectionCount?: number;
};

export function PageSkeleton({
  className,
  kpiCount = 0,
  sectionCount = 2,
}: PageSkeletonProps) {
  return (
    <div className={cn(dashboardTheme.page, className)}>
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {kpiCount > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: kpiCount }).map((_, index) => (
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
      ) : null}

      {Array.from({ length: sectionCount }).map((_, index) => (
        <Card key={index} className={dashboardTheme.card}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-40" />
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
  );
}
