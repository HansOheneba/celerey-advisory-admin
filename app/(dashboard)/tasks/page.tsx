import type { Metadata } from "next";
import { TasksWorkspace } from "@/components/tasks/tasks-workspace";
import { findTasksApi } from "@/lib/api/tasks";
import { requireSession } from "@/lib/dal";
import { listClients } from "@/lib/repositories/clients";

export const metadata: Metadata = {
  title: "Tasks",
};

export default async function TasksPage() {
  const session = await requireSession();
  const [clientsResult, tasksResult] = await Promise.all([
    listClients({
      page: 1,
      pageSize: 100,
      sortBy: "nextReviewAt",
      sortDir: "asc",
      ownBookOnly: true,
    }),
    findTasksApi(session.accessToken, { status: "all" }),
  ]);

  return (
    <TasksWorkspace
      clients={clientsResult.items}
      initialTasks={tasksResult.ok ? tasksResult.data.items : []}
    />
  );
}
