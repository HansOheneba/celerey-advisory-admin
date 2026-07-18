import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardTheme } from "@/lib/dashboard-theme";

export function ClientsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between">
        <Skeleton className="h-8 w-full max-w-md" />
        <div className="flex gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
      <Card className={dashboardTheme.tableShell}>
        <div className="space-y-3 p-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
