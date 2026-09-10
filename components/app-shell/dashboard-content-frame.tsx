import { cn } from "@/lib/utils";

/** Shared horizontal bounds for dashboard chrome and page content. */
export const dashboardContentFrameClass =
  "mx-auto w-full min-w-0 max-w-[var(--dashboard-max-width)] px-4 md:px-6 lg:px-8";

type DashboardContentFrameProps = {
  children: React.ReactNode;
  className?: string;
};

export function DashboardContentFrame({
  children,
  className,
}: DashboardContentFrameProps) {
  return (
    <div className={cn(dashboardContentFrameClass, className)}>{children}</div>
  );
}
