import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardTheme } from "@/lib/dashboard-theme";

export default function ClientDetailLoading() {
  return (
    <div className={dashboardTheme.page}>
      <div className="flex items-start gap-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className={dashboardTheme.kpiCard}>
            <CardHeader>
              <Skeleton className="h-3 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className={dashboardTheme.card}>
        <CardContent className="space-y-3 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
