"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { findAppointmentSlotsAction } from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";
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
  formatDayLabel,
  formatTimeLabel,
  toDateInput,
} from "@/lib/appointments/display";
import {
  APPOINTMENT_TYPE_LABELS,
  type AppointmentSlot,
  type AppointmentType,
} from "@/lib/appointments/types";
import { APPOINTMENT_DURATIONS } from "@/lib/settings/options";
import { cn } from "@/lib/utils";
import type { Client } from "@/types/client";

type ScheduleAppointmentDialogProps = {
  clients: Client[];
  onSchedule: (input: {
    clientId: string;
    type: AppointmentType;
    title: string;
    scheduledAt: string;
    durationMinutes: number;
  }) => void;
  pending: boolean;
};

export function ScheduleAppointmentDialog({
  clients,
  onSchedule,
  pending,
}: ScheduleAppointmentDialogProps) {
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
                onValueChange={(value) =>
                  setDuration(value ? Number(value) : 30)
                }
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
                          {formatDayLabel(slot.startAt)}{" "}
                          {formatTimeLabel(slot.startAt)}
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
