import { StatusPill, type StatusPillTone } from "@/components/ui/status-pill";
import { getStatusLabel } from "@/lib/appointments/display";
import type { AppointmentStatus } from "@/lib/appointments/types";
import { cn } from "@/lib/utils";

const STATUS_TONES: Record<AppointmentStatus, StatusPillTone> = {
  requested: "warning",
  proposed: "warning",
  counter_proposed: "orange",
  accepted: "blue",
  declined: "neutral",
  upcoming: "success",
  scheduled: "success",
  in_progress: "info",
  processing_notes: "brand",
  pending_review: "brand",
  published: "success",
  completed: "neutral",
  cancelled: "neutral",
};

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
  className?: string;
};

export function AppointmentStatusBadge({
  status,
  className,
}: AppointmentStatusBadgeProps) {
  return (
    <StatusPill
      label={getStatusLabel(status)}
      tone={STATUS_TONES[status]}
      className={cn(className)}
    />
  );
}
