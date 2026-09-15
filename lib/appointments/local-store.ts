import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from "@/lib/appointments/types";
import type { Client } from "@/types/client";

const STORAGE_KEY = "fidelity.advisor.appointments.v1";
const LEGACY_STORAGE_KEY = "celerey.appointments.v1";

function readStoredJson(): string | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    return raw;
  }
  const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy) {
    window.localStorage.setItem(STORAGE_KEY, legacy);
    return legacy;
  }
  return null;
}
const SEED_TYPES: AppointmentType[] = [
  "review",
  "onboarding",
  "goal_check_in",
  "portfolio_update",
];
const SEED_HOURS = [10, 14];

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function sortByScheduledAt(items: Appointment[]) {
  return [...items].sort(
    (a, b) =>
      (a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0) -
      (b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0),
  );
}

function seedAppointments(clients: Client[], advisorName: string): Appointment[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  const seeded = clients.slice(0, 6).map((client, index) => {
    const dayOffset = Math.floor(index / SEED_HOURS.length) + 1;
    const hour = SEED_HOURS[index % SEED_HOURS.length];
    const scheduledAt = new Date(base);
    scheduledAt.setDate(scheduledAt.getDate() + dayOffset);
    scheduledAt.setHours(hour, 0, 0, 0);

    return {
      id: `appt_${client.id}`,
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      advisorId: client.advisorId,
      advisorName: client.advisorName || advisorName,
      planYear: "",
      type: SEED_TYPES[index % SEED_TYPES.length],
      title: "",
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: 30,
      status: "upcoming" as AppointmentStatus,
      createdBy: "advisor" as const,
      log: null,
      progress: null,
      actionIds: [],
      documentIds: [],
    };
  });

  return sortByScheduledAt(seeded);
}

export function saveAppointments(items: Appointment[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function loadAppointments(
  clients: Client[],
  advisorName: string,
): Appointment[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = readStoredJson();
    if (raw) {
      const parsed = JSON.parse(raw) as Appointment[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sortByScheduledAt(parsed);
      }
    }
  } catch {
    // Fall through to seed.
  }

  const seeded = seedAppointments(clients, advisorName);
  saveAppointments(seeded);
  return seeded;
}

export function addAppointment(
  items: Appointment[],
  input: {
    clientId: string;
    clientName: string;
    advisorName: string;
    type: AppointmentType;
    scheduledAt: string;
    durationMinutes: number;
  },
): Appointment[] {
  const next = sortByScheduledAt([
    ...items,
    {
      id: createId("appt"),
      status: "upcoming",
      title: "",
      createdBy: "advisor",
      log: null,
      progress: null,
      advisorId: "",
      planYear: "",
      actionIds: [],
      documentIds: [],
      ...input,
    },
  ]);
  saveAppointments(next);
  return next;
}

export function updateAppointmentStatus(
  items: Appointment[],
  id: string,
  status: AppointmentStatus,
): Appointment[] {
  const next = items.map((item) =>
    item.id === id ? { ...item, status } : item,
  );
  saveAppointments(next);
  return next;
}
