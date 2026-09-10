"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toDateInput } from "@/lib/appointments/display";
import type { Appointment } from "@/lib/appointments/types";

type CounterProposeDialogProps = {
  appointment: Appointment | null;
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onSubmit: (input: { appointmentId: string; scheduledAt: string }) => void;
};

export function CounterProposeDialog({
  appointment,
  open,
  pending,
  onClose,
  onSubmit,
}: CounterProposeDialogProps) {
  const [date, setDate] = useState(() => toDateInput(new Date()));
  const [time, setTime] = useState("14:00");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!appointment) {
      return;
    }

    onSubmit({
      appointmentId: appointment.id,
      scheduledAt: new Date(`${date}T${time}`).toISOString(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Counter-propose a time</DialogTitle>
            <DialogDescription>
              Suggest an alternate slot for {appointment?.clientName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="counter-date">Date</Label>
              <Input
                id="counter-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="counter-time">Time</Label>
              <Input
                id="counter-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              Send counter-proposal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
