import type { Task, TaskPriority, TaskStatus } from "@/lib/tasks/types";
import type { Client } from "@/types/client";

const STORAGE_KEY = "fidelity.advisor.tasks.v1";
const LEGACY_STORAGE_KEY = "celerey.tasks.v1";

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
const MAX_SEEDED_TASKS = 12;

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
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

/**
 * Seed a starting task list grounded in real client data — overdue reviews,
 * unfinished onboarding, and clients without goals set — rather than
 * fabricating unrelated sample entries.
 */
function seedTasks(clients: Client[]): Task[] {
  const now = Date.now();
  const tasks: Task[] = [];

  for (const client of clients) {
    const clientName = `${client.firstName} ${client.lastName}`;
    const reviewDueAt = client.nextReviewAt
      ? new Date(client.nextReviewAt).getTime()
      : null;

    if (reviewDueAt !== null && reviewDueAt < now) {
      tasks.push({
        id: `task_review_${client.id}`,
        title: "Follow up on overdue review",
        description: null,
        clientId: client.id,
        clientName,
        sessionId: null,
        assignee: "advisor",
        category: "other",
        dueAt: client.nextReviewAt,
        priority: "high",
        status: "open",
      });
    }

    if (client.status === "onboarding") {
      tasks.push({
        id: `task_onboarding_${client.id}`,
        title: "Complete onboarding checklist",
        description: null,
        clientId: client.id,
        clientName,
        sessionId: null,
        assignee: "advisor",
        category: "other",
        dueAt: null,
        priority: "medium",
        status: "open",
      });
    }

    if (client.goalsCount === 0) {
      tasks.push({
        id: `task_goals_${client.id}`,
        title: "Set initial financial goals",
        description: null,
        clientId: client.id,
        clientName,
        sessionId: null,
        assignee: "advisor",
        category: "financial",
        dueAt: null,
        priority: "low",
        status: "open",
      });
    }
  }

  return sortTasks(tasks).slice(0, MAX_SEEDED_TASKS);
}

export function saveTasks(items: Task[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function loadTasks(clients: Client[]): Task[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = readStoredJson();
    if (raw) {
      const parsed = JSON.parse(raw) as Task[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sortTasks(parsed);
      }
    }
  } catch {
    // Fall through to seed.
  }

  const seeded = seedTasks(clients);
  saveTasks(seeded);
  return seeded;
}

export function addTask(
  items: Task[],
  input: {
    title: string;
    clientId: string | null;
    clientName: string | null;
    dueAt: string | null;
    priority: TaskPriority;
  },
): Task[] {
  const next = sortTasks([
    ...items,
    { id: createId("task"), status: "open", description: null, sessionId: null, assignee: "advisor", category: "other", ...input },
  ]);
  saveTasks(next);
  return next;
}

export function setTaskStatus(
  items: Task[],
  id: string,
  status: TaskStatus,
): Task[] {
  const next = sortTasks(
    items.map((item) => (item.id === id ? { ...item, status } : item)),
  );
  saveTasks(next);
  return next;
}
