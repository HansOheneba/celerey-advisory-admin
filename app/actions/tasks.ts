"use server";

import { revalidatePath } from "next/cache";
import {
  createTaskApi,
  findTasksApi,
  updateTaskStatusApi,
} from "@/lib/api/tasks";
import { requireSession } from "@/lib/dal";
import type {
  Task,
  TaskAssignee,
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from "@/lib/tasks/types";

export async function listTasksAction(
  status: TaskStatus | "all" = "all",
): Promise<{ ok: true; items: Task[] } | { ok: false; message: string }> {
  const session = await requireSession();
  const result = await findTasksApi(session.accessToken, { status });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, items: result.data.items };
}

export async function createTaskAction(input: {
  title: string;
  description?: string | null;
  clientId?: string | null;
  assignee?: TaskAssignee;
  category?: TaskCategory;
  dueAt?: string | null;
  priority: TaskPriority;
}): Promise<{ ok: true; task: Task } | { ok: false; message: string }> {
  const session = await requireSession();

  if (input.assignee === "client" && !input.clientId) {
    return {
      ok: false,
      message: "Choose a client before assigning work to them.",
    };
  }

  const result = await createTaskApi(session.accessToken, input);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");

  return { ok: true, task: result.data };
}

export async function updateTaskStatusAction(input: {
  taskId: string;
  status: TaskStatus;
}): Promise<{ ok: true; task: Task } | { ok: false; message: string }> {
  const session = await requireSession();
  const result = await updateTaskStatusApi(session.accessToken, input);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");

  return { ok: true, task: result.data };
}
