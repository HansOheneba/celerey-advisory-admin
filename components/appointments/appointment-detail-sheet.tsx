"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { MeetingProviderBadge } from "@/components/appointments/meeting-provider-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  APPOINTMENT_TYPE_LABELS,
  type Appointment,
} from "@/lib/appointments/types";
import {
  formatLongDate,
  formatTimeRange,
  getAppointmentTitle,
  isScheduledStatus,
} from "@/lib/appointments/display";

type AppointmentDetailSheetProps = {
  appointment: Appointment | null;
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onCancel: (id: string) => void;
  onLog?: (appointment: Appointment) => void;
};

function meetingHasPassed(appointment: Appointment) {
  if (!appointment.scheduledAt) {
    return false;
  }
  const end = new Date(appointment.scheduledAt);
  end.setMinutes(end.getMinutes() + appointment.durationMinutes);
  return end.getTime() < Date.now();
}

export function AppointmentDetailSheet({
  appointment,
  open,
  pending,
  onClose,
  onCancel,
  onLog,
}: AppointmentDetailSheetProps) {
  if (!appointment) {
    return null;
  }

  const canLog =
    onLog &&
    isScheduledStatus(appointment.status) &&
    meetingHasPassed(appointment);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/50 px-5 py-4 text-left">
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <AppointmentStatusBadge status={appointment.status} />
            {appointment.meetingProvider ? (
              <MeetingProviderBadge provider={appointment.meetingProvider} />
            ) : null}
          </div>
          <SheetTitle className="text-lg font-semibold">
            {getAppointmentTitle(appointment)}
          </SheetTitle>
          <SheetDescription className="space-y-1 text-sm">
            <Link
              href={`/clients/${appointment.clientId}`}
              className="font-medium text-foreground hover:underline"
            >
              {appointment.clientName}
            </Link>
            {" · "}
            {APPOINTMENT_TYPE_LABELS[appointment.type]}
            <br />
            {appointment.scheduledAt
              ? `${formatLongDate(appointment.scheduledAt)} · ${formatTimeRange(appointment.scheduledAt, appointment.durationMinutes)}`
              : "Awaiting scheduled time"}
            {appointment.advisorName ? (
              <>
                <br />
                With {appointment.advisorName}
              </>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {appointment.meetingUrl ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={appointment.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <ExternalLink />
              Join meeting
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Meeting link will appear once the appointment is confirmed.
            </p>
          )}

          {canLog ? (
            <div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
              <p className="text-sm font-medium">Meeting finished?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Log the session record for compliance. Notes and assessment
                live under Sessions.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-3"
                disabled={pending}
                onClick={() => onLog(appointment)}
              >
                Log session
              </Button>
            </div>
          ) : null}
        </div>

        <SheetFooter className="border-t border-border/50 px-5 py-4 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {appointment.status !== "cancelled" &&
          appointment.status !== "completed" ? (
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => onCancel(appointment.id)}
            >
              Cancel appointment
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
