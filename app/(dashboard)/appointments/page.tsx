import type { Metadata } from "next";
import { AppointmentsWorkspace } from "@/components/appointments/appointments-workspace";
import { findAppointmentsApi } from "@/lib/api/appointments";
import { requireSession } from "@/lib/dal";
import { listClients } from "@/lib/repositories/clients";

export const metadata: Metadata = {
  title: "Appointments",
};

export default async function AppointmentsPage() {
  const session = await requireSession();
  const [clientsResult, appointmentsResult] = await Promise.all([
    listClients({
      page: 1,
      pageSize: 100,
      sortBy: "name",
      sortDir: "asc",
      ownBookOnly: true,
    }),
    findAppointmentsApi(session.accessToken, { status: "all" }),
  ]);

  const assignedClientIds = new Set(
    clientsResult.items.map((client) => client.id),
  );
  const appointments = appointmentsResult.ok
    ? appointmentsResult.data.items.filter((appointment) =>
        assignedClientIds.has(appointment.clientId),
      )
    : [];

  return (
    <AppointmentsWorkspace
      clients={clientsResult.items}
      initialAppointments={appointments}
    />
  );
}
