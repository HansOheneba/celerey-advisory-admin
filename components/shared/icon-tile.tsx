import type { LucideIcon } from "lucide-react";

import { CelereyAiSymbol } from "@/components/brand/celerey-ai-symbol";
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
  icon?: LucideIcon;
  symbol?: "celerey-ai";
  variant?: TintedSurfaceVariant | "default";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSES = {
  sm: "size-8 rounded-md [&_svg]:size-4",
  md: "size-10 rounded-md [&_svg]:size-4",
  lg: "size-10 rounded-md [&_svg]:size-5",
} as const;

const SYMBOL_SIZE = {
  sm: "sm",
  md: "md",
  lg: "lg",
} as const;

export function IconTile({
  icon: Icon,
  symbol,
  variant = "default",
  size = "md",
  className,
}: IconTileProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        TILE_VARIANTS[variant],
        SIZE_CLASSES[size],
        className,
      )}
    >
      {symbol === "celerey-ai" ? (
        <CelereyAiSymbol size={SYMBOL_SIZE[size]} />
      ) : Icon ? (
        <Icon aria-hidden />
      ) : null}
    </div>
  );
}
