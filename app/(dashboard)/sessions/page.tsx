import type { Metadata } from "next";

import { SessionsWorkspace } from "@/components/sessions/sessions-workspace";
import { findAppointmentsApi } from "@/lib/api/appointments";
import { requireSession } from "@/lib/dal";
import { listClients } from "@/lib/repositories/clients";

export const metadata: Metadata = {
  title: "Sessions",
};

type SessionsPageProps = {
  searchParams: Promise<{ client?: string }>;
};

export default async function SessionsPage({ searchParams }: SessionsPageProps) {
  const session = await requireSession();
  const { client: clientId } = await searchParams;

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

  const initialClientId =
    clientId && assignedClientIds.has(clientId) ? clientId : undefined;

  return (
    <SessionsWorkspace
      clients={clientsResult.items}
      initialAppointments={appointments}
      initialClientId={initialClientId}
    />
  );
}
