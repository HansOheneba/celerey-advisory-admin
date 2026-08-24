import "server-only";

import { executeApi } from "@/lib/api/execute";
import type {
  Task,
  TaskAssignee,
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from "@/lib/tasks/types";

const PRIORITIES = new Set<TaskPriority>(["low", "medium", "high"]);
const STATUSES = new Set<TaskStatus>(["open", "done"]);
const ASSIGNEES = new Set<TaskAssignee>(["advisor", "client"]);
const CATEGORIES = new Set<TaskCategory>(["financial", "documents", "other"]);

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeTask(row: Record<string, unknown>): Task {
  const priority = asString(row.priority, "medium");
  const status = asString(row.status, "open");
  const assignee = asString(row.assignee, "advisor");
  const category = asString(row.category, "other");
  const clientId = row.clientId ?? row.client_id;
  const clientName = row.clientName ?? row.client_name;
  const sessionId = row.sessionId ?? row.session_id;
  const dueAt = row.dueAt ?? row.due_at;
  const description = row.description;

  return {
    id: asString(row.id),
    title: asString(row.title),
    description:
      typeof description === "string" && description ? description : null,
    clientId: typeof clientId === "string" && clientId ? clientId : null,
    clientName:
      typeof clientName === "string" && clientName ? clientName : null,
    sessionId: typeof sessionId === "string" && sessionId ? sessionId : null,
    assignee: ASSIGNEES.has(assignee as TaskAssignee)
      ? (assignee as TaskAssignee)
      : "advisor",
    category: CATEGORIES.has(category as TaskCategory)
      ? (category as TaskCategory)
      : "other",
    dueAt: typeof dueAt === "string" && dueAt ? dueAt : null,
    priority: PRIORITIES.has(priority as TaskPriority)
      ? (priority as TaskPriority)
      : "medium",
    status: STATUSES.has(status as TaskStatus)
      ? (status as TaskStatus)
      : "open",
  };
}

function sortTasks(items: Task[]) {
  return [...items].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "open" ? -1 : 1;
    }
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });
}

export async function findTasksApi(
  accessToken: string,
  params: {
    status?: TaskStatus | "all";
    assignee?: TaskAssignee | "all";
    clientId?: string;
  } = {},
) {
  const result = await executeApi<{
    items?: Array<Record<string, unknown>>;
  }>("admin.tasks.find", {
    method: "GET",
    accessToken,
    searchParams: {
      status: params.status ?? "all",
      assignee: params.assignee ?? "all",
      clientId: params.clientId,
    },
  });

  if (!result.ok) {
    return result;
  }

  const items = Array.isArray(result.data.items) ? result.data.items : [];

  return {
    ok: true as const,
    status: result.status,
    data: {
      items: sortTasks(items.map(normalizeTask)),
    },
  };
}

export async function createTaskApi(
  accessToken: string,
  input: {
    title: string;
    description?: string | null;
    clientId?: string | null;
    assignee?: TaskAssignee;
    category?: TaskCategory;
    dueAt?: string | null;
    priority: TaskPriority;
  },
) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.tasks.create",
    {
      method: "POST",
      accessToken,
      body: {
        title: input.title,
        priority: input.priority,
        assignee: input.assignee ?? "advisor",
        category: input.category ?? "other",
        ...(input.description ? { description: input.description } : {}),
        ...(input.clientId ? { clientId: input.clientId } : {}),
        ...(input.dueAt ? { dueAt: input.dueAt } : {}),
      },
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeTask(result.data),
  };
}

export async function updateTaskStatusApi(
  accessToken: string,
  input: { taskId: string; status: TaskStatus },
) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.tasks.update-status",
    {
      method: "PUT",
      accessToken,
      body: {
        taskId: input.taskId,
        status: input.status,
      },
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeTask(result.data),
  };
}
