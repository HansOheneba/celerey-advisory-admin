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
  const hasHeader = Boolean(title || description || actions);

  return (
    <section
      className={cn(
        dashboardTheme.card,
        "overflow-hidden",
        variant === "muted" && dashboardTheme.surfaceMuted,
        variant !== "default" &&
          variant !== "muted" &&
          dashboardTheme.tintedSurface[variant],
        className,
      )}
    >
      {hasHeader ? (
        <>
          <div
            className={cn(
              dashboardTheme.sectionHeader,
              "flex flex-wrap items-start justify-between gap-3",
            )}
          >
            <div className="space-y-1">
              {title ? (
                <h2 className={dashboardTheme.sectionTitle}>{title}</h2>
              ) : null}
              {description ? (
                <p className={dashboardTheme.sectionDescription}>
                  {description}
                </p>
              ) : null}
            </div>
            {actions ? (
              <div className="flex items-center gap-2">{actions}</div>
            ) : null}
          </div>
          <div className={dashboardTheme.sectionBody}>{children}</div>
        </>
      ) : (
        <div className="p-5">{children}</div>
      )}
    </section>
  );
}
