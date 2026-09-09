import type { LucideIcon } from "lucide-react";

import { dashboardTheme, type TintedSurfaceVariant } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

const TILE_VARIANTS: Record<TintedSurfaceVariant | "default", string> = {
  default: dashboardTheme.iconTile,
  brand: dashboardTheme.iconTile,
  success: dashboardTheme.iconTileSuccess,
  warning: dashboardTheme.iconTileWarning,
  info: dashboardTheme.iconTileInfo,
  ai: dashboardTheme.iconTileAi,
  muted: dashboardTheme.iconTile,
};

type IconTileProps = {
  icon: LucideIcon;
  variant?: TintedSurfaceVariant | "default";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSES = {
  sm: "size-8 [&_svg]:size-4",
  md: "size-9 [&_svg]:size-[18px]",
  lg: "size-11 [&_svg]:size-5",
} as const;

export function IconTile({
  icon: Icon,
  variant = "default",
  size = "md",
  className,
}: IconTileProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg",
        TILE_VARIANTS[variant],
        SIZE_CLASSES[size],
        className,
      )}
    >
      <Icon aria-hidden />
    </div>
  );
}
