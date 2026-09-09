import Link from "next/link";

import { dashboardTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

type ListRowProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  href?: string;
  className?: string;
};

export function ListRow({
  title,
  description,
  meta,
  leading,
  trailing,
  href,
  className,
}: ListRowProps) {
  const content = (
    <>
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">{title}</div>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        {meta ? (
          <div className="text-xs text-muted-foreground">{meta}</div>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(dashboardTheme.listRow, className)}>
        {content}
      </Link>
    );
  }

  return <div className={cn(dashboardTheme.listRow, className)}>{content}</div>;
}
