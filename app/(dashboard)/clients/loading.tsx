import { ClientsTableSkeleton } from "@/components/clients/clients-table-skeleton";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsLoading() {
  return (
    <div className={dashboardTheme.page}>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <ClientsTableSkeleton />
    </div>
  );
}
