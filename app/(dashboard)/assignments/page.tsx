import type { Metadata } from "next";
import { AssignmentsWorkspace } from "@/components/assignments/assignments-workspace";
import {
  filterRelationshipManagers,
  mergeAssignableAdvisors,
} from "@/lib/advisors/assignable";
import { requireAdmin } from "@/lib/dal";
import { listClients } from "@/lib/repositories/clients";
import { listAdvisors } from "@/lib/repositories/advisors";

export const metadata: Metadata = {
  title: "Assignments",
};

export default async function AssignmentsPage() {
  const session = await requireAdmin();

  const [clientsResult, advisorsResult] = await Promise.all([
    listClients({ page: 1, pageSize: 100, sortBy: "name", sortDir: "asc" }),
    listAdvisors({ page: 1, pageSize: 100 }),
  ]);

  const unassignedClients = clientsResult.items.filter(
    (client) => !client.advisorId,
  );

  const assignableAdvisors = filterRelationshipManagers(
    mergeAssignableAdvisors(advisorsResult.items, session),
  );

  return (
    <AssignmentsWorkspace
      unassignedClients={unassignedClients}
      advisors={assignableAdvisors}
    />
  );
}
