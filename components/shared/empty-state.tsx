import type { LucideIcon } from "lucide-react";

import { IconTile } from "@/components/shared/icon-tile";
import { dashboardTheme, type TintedSurfaceVariant } from "@/lib/dashboard-theme";
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
  icon,
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
        "celerey-enter flex flex-col items-center gap-3",
        variant !== "default" && dashboardTheme.tintedSurface[variant],
        className,
      )}
    >
      <IconTile icon={icon} variant={variant === "default" ? "brand" : variant} size="lg" />
      <div className="max-w-sm space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
