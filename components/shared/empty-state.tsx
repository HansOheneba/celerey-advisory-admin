import type { LucideIcon } from "lucide-react";

import { dashboardTheme, type TintedSurfaceVariant } from "@/lib/dashboard-theme";
import { headingTitle } from "@/lib/format";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: TintedSurfaceVariant | "default";
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        dashboardTheme.emptyState,
        "celerey-enter flex flex-col items-center text-center",
        variant !== "default" && dashboardTheme.tintedSurface[variant],
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-md bg-secondary text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </div>
      <h2 className="mt-4 text-sm font-medium">{headingTitle(title)}</h2>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
