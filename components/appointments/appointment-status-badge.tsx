import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/lib/appointments/display";
import type { AppointmentStatus } from "@/lib/appointments/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
  AppointmentStatus,
  { variant: "secondary" | "outline" | "default"; className?: string }
> = {
  requested: {
    variant: "outline",
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200",
  },
  upcoming: {
    variant: "outline",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200",
  },
  completed: {
    variant: "secondary",
    className: "text-muted-foreground",
  },
  cancelled: {
    variant: "outline",
    className: "text-muted-foreground",
  },
};

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
  className?: string;
};

export function AppointmentStatusBadge({
  status,
  className,
}: AppointmentStatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <Badge
      variant={style.variant}
      className={cn(
        "rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em] uppercase",
        style.className,
        className,
      )}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}
