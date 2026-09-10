import type { LucideIcon } from "lucide-react";

import { IconTile } from "@/components/shared/icon-tile";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: LucideIcon;
  iconVariant?: "brand" | "ai" | "info";
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  icon: Icon,
  iconVariant = "brand",
}: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? <IconTile icon={Icon} variant={iconVariant} size="lg" /> : null}
        <div className="min-w-0 space-y-1">
          {eyebrow ? (
            <p
              className={cn(
                dashboardTheme.sectionLabel,
                iconVariant === "ai" && "text-accent-purple",
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1 className={dashboardTheme.pageTitle}>{title}</h1>
          {description ? (
            <p className={dashboardTheme.pageDescription}>{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
