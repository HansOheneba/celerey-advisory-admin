"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";
import Link from "next/link";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createTaskAction, updateTaskStatusAction } from "@/app/actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TASK_ASSIGNEE_LABELS,
  TASK_CATEGORY_LABELS,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskAssignee,
  type TaskCategory,
  type TaskPriority,
} from "@/lib/tasks/types";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Client } from "@/types/client";

type TasksWorkspaceProps = {
  clients: Client[];
  initialTasks: Task[];
};

const PRIORITY_BADGE_VARIANT: Record<
  TaskPriority,
  "destructive" | "default" | "secondary"
> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

function AddTaskDialog({
  clients,
  onAdd,
  pending,
}: {
  clients: Client[];
  onAdd: (input: {
    title: string;
    clientId: string | null;
    assignee: TaskAssignee;
    category: TaskCategory;
    dueAt: string | null;
    priority: TaskPriority;
  }) => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [assignee, setAssignee] = useState<TaskAssignee>("advisor");
  const [category, setCategory] = useState<TaskCategory>("other");
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    onAdd({
      title: title.trim(),
      clientId: clientId || null,
      assignee,
      category,
      dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      priority,
    });

    setOpen(false);
    setTitle("");
    setClientId("");
    setAssignee("advisor");
    setCategory("other");
    setDueAt("");
    setPriority("medium");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" />}>
        <Plus />
        Add task
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
          <DialogDescription>
            Keep a follow-up for yourself, or assign work a client can complete.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskTitle">Title</Label>
            <Input
              id="taskTitle"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Send updated fact find"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taskClient">
              {assignee === "client" ? "Client" : "Client (optional)"}
            </Label>
            <Select
              value={clientId}
              onValueChange={(value) => setClientId(value ?? "")}
            >
              <SelectTrigger id="taskClient" className="w-full">
                <SelectValue placeholder="No client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskAssignee">Assigned to</Label>
              <Select
                value={assignee}
                onValueChange={(value) => {
                  const next = (value as TaskAssignee) ?? "advisor";
                  setAssignee(next);
                  if (next === "advisor") {
                    return;
                  }
                }}
              >
                <SelectTrigger id="taskAssignee" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_ASSIGNEE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskCategory">Category</Label>
              <Select
                value={category}
                onValueChange={(value) =>
                  setCategory((value as TaskCategory) ?? "other")
                }
              >
                <SelectTrigger id="taskCategory" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskDue">Due date</Label>
              <Input
                id="taskDue"
                type="date"
                value={dueAt}
                onChange={(event) => setDueAt(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskPriority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) =>
                  setPriority((value as TaskPriority) ?? "medium")
                }
              >
                <SelectTrigger id="taskPriority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={
                !title.trim() ||
                pending ||
                (assignee === "client" && !clientId)
              }
            >
              Add task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskRow({
  task,
  onToggle,
  pending,
}: {
  task: Task;
  onToggle: (checked: boolean) => void;
  pending: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Checkbox
        checked={task.status === "done"}
        disabled={pending}
        onCheckedChange={(checked) => onToggle(Boolean(checked))}
        aria-label={`Mark "${task.title}" as ${task.status === "done" ? "open" : "done"}`}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium",
            task.status === "done" && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {task.assignee === "client" ? "Assigned to client" : "Your follow-up"}
          {task.clientId ? (
            <>
              {" · "}
              <Link href={`/clients/${task.clientId}`} className="hover:underline">
                {task.clientName}
              </Link>
            </>
          ) : null}
          {task.dueAt ? ` · Due ${formatDate(task.dueAt)}` : ""}
        </p>
      </div>
      <Badge
        variant={PRIORITY_BADGE_VARIANT[task.priority]}
        className="shrink-0"
      >
        {TASK_PRIORITY_LABELS[task.priority]}
      </Badge>
    </div>
  );
}

export function TasksWorkspace({ clients, initialTasks }: TasksWorkspaceProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [pending, startTransition] = useTransition();

  const open = useMemo(
    () => tasks.filter((task) => task.status === "open"),
    [tasks],
  );
  const done = useMemo(
    () => tasks.filter((task) => task.status === "done"),
    [tasks],
  );

  function handleAdd(input: {
    title: string;
    clientId: string | null;
    assignee: TaskAssignee;
    category: TaskCategory;
    dueAt: string | null;
    priority: TaskPriority;
  }) {
    startTransition(async () => {
      const result = await createTaskAction(input);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setTasks((current) => [result.task, ...current]);
      toast.success("Task added");
    });
  }

  function handleToggle(id: string, checked: boolean) {
    const status = checked ? "done" : "open";
    startTransition(async () => {
      const result = await updateTaskStatusAction({ taskId: id, status });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setTasks((current) =>
        current.map((task) => (task.id === id ? result.task : task)),
      );
    });
  }

  return (
    <div className={dashboardTheme.page}>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-0.5">
          <SectionEyebrow>Workflow</SectionEyebrow>
          <h2 className={dashboardTheme.pageTitle}>Tasks</h2>
          <p className={dashboardTheme.pageDescription}>
            Follow-ups for you, plus work assigned to clients on your book.
          </p>
        </div>
        <AddTaskDialog clients={clients} onAdd={handleAdd} pending={pending} />
      </section>

      <Card className={dashboardTheme.card}>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Open ({open.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/50 p-0">
          {open.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nothing outstanding — nice work.
            </div>
          ) : (
            open.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                pending={pending}
                onToggle={(checked) => handleToggle(task.id, checked)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {done.length > 0 ? (
        <Card className={dashboardTheme.card}>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Completed ({done.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/50 p-0">
            {done.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                pending={pending}
                onToggle={(checked) => handleToggle(task.id, checked)}
              />
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
