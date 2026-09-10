import { CelereyAiSymbol } from "@/components/brand/celerey-ai-symbol";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardTheme } from "@/lib/dashboard-theme";

export default function CopilotLoading() {
  return (
    <div className={dashboardTheme.page}>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 py-16">
        <CelereyAiSymbol size="hero" className="size-[4.5rem] opacity-60" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid w-full gap-2 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
