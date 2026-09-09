import { dashboardTheme, type TintedSurfaceVariant } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

type SectionPanelProps = {
  title?: string;
  description?: string;
  variant?: "default" | "muted" | TintedSurfaceVariant;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function SectionPanel({
  title,
  description,
  variant = "default",
  actions,
  children,
  className,
}: SectionPanelProps) {
  return (
    <section
      className={cn(
        dashboardTheme.section,
        variant === "muted" && dashboardTheme.surfaceMuted,
        variant !== "default" &&
          variant !== "muted" &&
          dashboardTheme.tintedSurface[variant],
        className,
      )}
    >
      {title || description || actions ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            {title ? (
              <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
