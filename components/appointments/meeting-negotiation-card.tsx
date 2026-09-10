"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { MeetingProviderBadge } from "@/components/appointments/meeting-provider-badge";
import type { Appointment } from "@/lib/appointments/types";
import {
  formatLongDate,
  formatTimeRange,
  getAppointmentTitle,
  getClientInitials,
} from "@/lib/appointments/display";
import { cn } from "@/lib/utils";

type MeetingNegotiationCardProps = {
  appointment: Appointment;
  pending: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onCounter: (appointment: Appointment) => void;
};

export function MeetingNegotiationCard({
  appointment,
  pending,
  onAccept,
  onDecline,
  onCounter,
}: MeetingNegotiationCardProps) {
  const title = getAppointmentTitle(appointment);

  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-1 gap-3">
          <Avatar size="default" className="mt-0.5 shrink-0">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {getClientInitials(appointment.clientName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link
                href={`/clients/${appointment.clientId}`}
                className="text-sm font-semibold text-foreground hover:underline"
              >
                {appointment.clientName}
              </Link>
              <AppointmentStatusBadge status={appointment.status} />
              {appointment.meetingProvider ? (
                <MeetingProviderBadge provider={appointment.meetingProvider} />
              ) : null}
            </div>
            <p className="text-sm text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">
              {formatLongDate(appointment.scheduledAt)}
            </p>
            <p className="text-sm text-muted-foreground">
              {appointment.scheduledAt
                ? formatTimeRange(
                    appointment.scheduledAt,
                    appointment.durationMinutes,
                  )
                : `${appointment.durationMinutes} min · flexible timing`}
            </p>
            {appointment.proposedBy ? (
              <p className="text-xs text-muted-foreground">
                Proposed by{" "}
                {appointment.proposedBy === "client" ? "client" : "advisor"}
              </p>
            ) : null}
          </div>
        </div>
        <div
          className={cn(
            "flex shrink-0 flex-wrap items-center gap-2",
            "border-t border-border/50 pt-4 sm:border-t-0 sm:pt-0",
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => onDecline(appointment.id)}
          >
            Decline
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => onCounter(appointment)}
          >
            Counter-propose
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() => onAccept(appointment.id)}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
