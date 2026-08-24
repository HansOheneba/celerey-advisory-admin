"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import {
  confirmAppointmentAction,
  createAppointmentAction,
  findAppointmentSlotsAction,
  logAppointmentAction,
  updateAppointmentStatusAction,
} from "@/app/actions/appointments";
import { LogSessionDialog } from "@/components/appointments/log-session-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPOINTMENT_TYPE_LABELS,
  type Appointment,
  type AppointmentSlot,
  type AppointmentType,
  type SessionLogInput,
} from "@/lib/appointments/types";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { APPOINTMENT_DURATIONS } from "@/lib/settings/options";
import { cn } from "@/lib/utils";
import type { Client } from "@/types/client";

type AppointmentsWorkspaceProps = {
  clients: Client[];
  initialAppointments: Appointment[];
};

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayLabel(iso: string | null) {
  if (!iso) {
    return "Unscheduled";
  }
  const date = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 864e5);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

function timeLabel(iso: string | null) {
  if (!iso) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function ScheduleAppointmentDialog({
  clients,
  onSchedule,
  pending,
}: {
  clients: Client[];
  onSchedule: (input: {
    clientId: string;
    type: AppointmentType;
    title: string;
    scheduledAt: string;
    durationMinutes: number;
  }) => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [type, setType] = useState<AppointmentType>("review");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(30);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [slotsPending, startSlots] = useTransition();

  useEffect(() => {
    if (!open || !clientId) {
      setSlots([]);
      return;
    }

    const from = toDateInput(new Date());
    const until = new Date();
    until.setDate(until.getDate() + 13);

    startSlots(async () => {
      const result = await findAppointmentSlotsAction({
        clientId,
        from,
        to: toDateInput(until),
        durationMinutes: duration,
      });
      if (!result.ok) {
        setSlots([]);
        return;
      }
      setSlots(result.items.slice(0, 12));
    });
  }, [open, clientId, duration]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clientId || !date || !time) {
      return;
    }

    onSchedule({
      clientId,
      type,
      title: APPOINTMENT_TYPE_LABELS[type],
      scheduledAt: new Date(`${date}T${time}`).toISOString(),
      durationMinutes: duration,
    });

    setOpen(false);
    setClientId("");
    setDate("");
    setTime("10:00");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" />}>
        <Plus />
        Schedule appointment
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule appointment</DialogTitle>
          <DialogDescription>
            Prefer an overlapping slot, or pick a time yourself.
          </DialogDescription>
        </DialogHeader>
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No clients are assigned to you yet. Assignments happen before you
            can schedule.
          </p>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apptClient">Client</Label>
            <Select
              value={clientId || null}
              onValueChange={(value) => setClientId(value ?? "")}
            >
              <SelectTrigger id="apptClient" className="w-full">
                <SelectValue placeholder="Choose a client">
                  {(selected: string | null) => {
                    const client = clients.find(
                      (item) => item.id === (selected ?? clientId),
                    );
                    return client
                      ? `${client.firstName} ${client.lastName}`
                      : "Choose a client";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apptType">Type</Label>
            <Select
              value={type}
              onValueChange={(value) =>
                setType((value as AppointmentType) ?? "review")
              }
            >
              <SelectTrigger id="apptType" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(APPOINTMENT_TYPE_LABELS).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apptDate">Date</Label>
              <Input
                id="apptDate"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apptTime">Time</Label>
              <Input
                id="apptTime"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apptDuration">Duration</Label>
            <Select
              value={String(duration)}
              onValueChange={(value) => setDuration(value ? Number(value) : 30)}
            >
              <SelectTrigger id="apptDuration" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_DURATIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {clientId ? (
            <div className="space-y-2">
              <Label>Openings (next 2 weeks)</Label>
              {slotsPending ? (
                <p className="text-sm text-muted-foreground">Finding slots…</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No overlap with this client yet. Pick a time below anyway.
                </p>
              ) : (
                <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
                  {slots.map((slot) => {
                    const start = new Date(slot.startAt);
                    const selected =
                      date === toDateInput(start) &&
                      time === start.toTimeString().slice(0, 5);
                    return (
                      <button
                        key={slot.startAt}
                        type="button"
                        onClick={() => {
                          setDate(toDateInput(start));
                          setTime(start.toTimeString().slice(0, 5));
                        }}
                        className={cn(
                          "h-8 rounded-lg border px-2.5 text-xs font-medium",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {dayLabel(slot.startAt)} {timeLabel(slot.startAt)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="submit"
              disabled={!clientId || !date || !time || pending}
            >
              Schedule
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AppointmentsWorkspace({
  clients,
  initialAppointments,
}: AppointmentsWorkspaceProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [pending, startTransition] = useTransition();
  const [logging, setLogging] = useState<Appointment | null>(null);

  const requested = useMemo(
    () =>
      appointments.filter((appointment) => appointment.status === "requested"),
    [appointments],
  );

  const upcoming = useMemo(
    () =>
      appointments.filter((appointment) => appointment.status === "upcoming"),
    [appointments],
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, Appointment[]>();
    for (const appointment of upcoming) {
      if (!appointment.scheduledAt) {
        continue;
      }
      const key = dayLabel(appointment.scheduledAt);
      groups.set(key, [...(groups.get(key) ?? []), appointment]);
    }
    return Array.from(groups.entries());
  }, [upcoming]);

  function handleSchedule(input: {
    clientId: string;
    type: AppointmentType;
    title: string;
    scheduledAt: string;
    durationMinutes: number;
  }) {
    startTransition(async () => {
      const result = await createAppointmentAction(input);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setAppointments((current) =>
        [...current, result.appointment].sort(
          (a, b) =>
            (a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0) -
            (b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0),
        ),
      );
      toast.success("Appointment scheduled");
    });
  }

  function setStatus(id: string, status: "cancelled") {
    startTransition(async () => {
      const result = await updateAppointmentStatusAction({
        appointmentId: id,
        status,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setAppointments((current) =>
        current.map((item) => (item.id === id ? result.appointment : item)),
      );
      toast.success("Appointment cancelled");
    });
  }

  function confirmRequest(id: string) {
    startTransition(async () => {
      const result = await confirmAppointmentAction({ appointmentId: id });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setAppointments((current) =>
        current.map((item) => (item.id === id ? result.appointment : item)),
      );
      toast.success("Session confirmed");
    });
  }

  function handleLog(input: SessionLogInput) {
    startTransition(async () => {
      const result = await logAppointmentAction(input);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setAppointments((current) =>
        current.map((item) =>
          item.id === result.appointment.id ? result.appointment : item,
        ),
      );
      setLogging(null);
      toast.success("Session logged");
    });
  }

  return (
    <div className={dashboardTheme.page}>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-0.5">
          <p className={dashboardTheme.sectionLabel}>Calendar</p>
          <h2 className={dashboardTheme.pageTitle}>Appointments</h2>
          <p className={dashboardTheme.pageDescription}>
            Book sessions, confirm client requests, and log notes the client
            sees on their Advisory page.
          </p>
        </div>
        <ScheduleAppointmentDialog
          clients={clients}
          onSchedule={handleSchedule}
          pending={pending}
        />
      </section>

      {requested.length > 0 ? (
        <Card className={dashboardTheme.card}>
          <CardHeader>
            <p className={dashboardTheme.sectionLabel}>Inbox</p>
            <CardTitle className="text-base font-semibold">
              Session requests
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/50 p-0">
            {requested.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/clients/${appointment.clientId}`}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {appointment.clientName}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {appointment.scheduledAt
                      ? `Prefers ${dayLabel(appointment.scheduledAt)} ${timeLabel(appointment.scheduledAt)}`
                      : "Flexible — confirm a time"}{" "}
                    · {APPOINTMENT_TYPE_LABELS[appointment.type]}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    disabled={pending}
                    onClick={() => confirmRequest(appointment.id)}
                  >
                    Confirm
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Decline request"
                    disabled={pending}
                    onClick={() => setStatus(appointment.id, "cancelled")}
                  >
                    <X />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {upcoming.length === 0 && requested.length === 0 ? (
        <div className={dashboardTheme.emptyState}>
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium">No upcoming appointments</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Schedule one to see it appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([day, items]) => (
            <Card key={day} className={dashboardTheme.card}>
              <CardHeader>
                <CardTitle className="text-base font-semibold">{day}</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border/50 p-0">
                {items.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="w-16 shrink-0 text-sm font-medium tabular-nums">
                        {timeLabel(appointment.scheduledAt)}
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/clients/${appointment.clientId}`}
                          className="truncate text-sm font-medium hover:underline"
                        >
                          {appointment.clientName}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">
                          {APPOINTMENT_TYPE_LABELS[appointment.type]} ·{" "}
                          {appointment.durationMinutes} min
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() => setLogging(appointment)}
                      >
                        Log session
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Cancel appointment"
                        disabled={pending}
                        onClick={() => setStatus(appointment.id, "cancelled")}
                      >
                        <X />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LogSessionDialog
        appointment={logging}
        pending={pending}
        onClose={() => setLogging(null)}
        onSubmit={handleLog}
      />
    </div>
  );
}
