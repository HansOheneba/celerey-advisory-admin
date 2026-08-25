"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import type { Appointment } from "@/lib/appointments/types";
import {
  formatLongDate,
  formatTimeLabel,
  formatTimeRange,
  getAppointmentTitle,
  getClientInitials,
} from "@/lib/appointments/display";
import { dashboardTheme } from "@/lib/dashboard-theme";

type AppointmentRequestCardProps = {
  appointment: Appointment;
  pending: boolean;
  onConfirm: (id: string) => void;
  onDecline: (id: string) => void;
};

export function AppointmentRequestCard({
  appointment,
  pending,
  onConfirm,
  onDecline,
}: AppointmentRequestCardProps) {
  const title = getAppointmentTitle(appointment);

  return (
    <Card className={dashboardTheme.card}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <Avatar size="lg">
              <AvatarFallback className="bg-primary text-sm text-primary-foreground">
                {getClientInitials(appointment.clientName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/clients/${appointment.clientId}`}
                  className="text-sm font-semibold hover:underline"
                >
                  {appointment.clientName}
                </Link>
                <AppointmentStatusBadge status="requested" />
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
                  : `${formatTimeLabel(appointment.scheduledAt)} · ${appointment.durationMinutes} min`}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
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
              size="sm"
              disabled={pending}
              onClick={() => onConfirm(appointment.id)}
            >
              Confirm
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
