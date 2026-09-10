export type TaskPriority = "low" | "medium" | "high";

export type TaskStatus = "open" | "done";

export type TaskAssignee = "advisor" | "client";

export type TaskCategory = "financial" | "documents" | "goals" | "other";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  clientId: string | null;
  clientName: string | null;
  sessionId: string | null;
  assignee: TaskAssignee;
  category: TaskCategory;
  dueAt: string | null;
  priority: TaskPriority;
  status: TaskStatus;
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const TASK_ASSIGNEE_LABELS: Record<TaskAssignee, string> = {
  advisor: "You",
  client: "Client",
};

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  financial: "Financial",
  documents: "Documents",
  goals: "Goals",
  other: "Other",
};
