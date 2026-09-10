"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { MeetingProviderBadge } from "@/components/appointments/meeting-provider-badge";
import { SessionNotesContent } from "@/components/appointments/session-notes-content";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
} from "@/lib/appointments/display";

type MeetingDetailSheetProps = {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  showClientLink?: boolean;
};

export function MeetingDetailSheet({
  appointment,
  open,
  onClose,
  showClientLink = true,
}: MeetingDetailSheetProps) {
  if (!appointment) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
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
            {showClientLink ? (
              <span>
                <Link
                  href={`/clients/${appointment.clientId}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {appointment.clientName}
                </Link>
                {" · "}
              </span>
            ) : null}
            {APPOINTMENT_TYPE_LABELS[appointment.type]} ·{" "}
            {appointment.scheduledAt
              ? `${formatLongDate(appointment.scheduledAt)} · ${formatTimeRange(appointment.scheduledAt, appointment.durationMinutes)}`
              : "Date not recorded"}
            {appointment.advisorName ? (
              <>
                {" · "}
                {appointment.advisorName}
              </>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {appointment.meetingUrl ? (
            <div className="mb-6">
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
                Join link
              </Button>
            </div>
          ) : null}

          <SessionNotesContent appointment={appointment} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
