"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";
import Link from "next/link";
import { Send } from "lucide-react";
import { toast } from "sonner";
import {
  createMessageThreadAction,
  getMessageThreadAction,
  markThreadReadAction,
  sendMessageAction,
} from "@/app/actions/messages";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ConversationThread } from "@/lib/messages/types";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatDate, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Client } from "@/types/client";

type MessagesWorkspaceProps = {
  clients: Client[];
  initialThreads: ConversationThread[];
};

function lastPreview(thread: ConversationThread) {
  const last = [...thread.messages]
    .reverse()
    .find((message) => message.author !== "note");
  if (!last) {
    return "No messages yet";
  }
  const prefix = last.author === "advisor" ? "You · " : "Client · ";
  return `${prefix}${last.body}`;
}

export function MessagesWorkspace({
  clients,
  initialThreads,
}: MessagesWorkspaceProps) {
  const [threads, setThreads] = useState(initialThreads);
  const [activeId, setActiveId] = useState<string | null>(
    initialThreads[0]?.id ?? null,
  );
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [historyPending, startHistory] = useTransition();

  useEffect(() => {
    if (!activeId) {
      return;
    }

    let cancelled = false;

    startHistory(async () => {
      const result = await getMessageThreadAction(activeId);
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setThreads((current) =>
        current.map((thread) =>
          thread.id === result.thread.id
            ? { ...thread, ...result.thread }
            : thread,
        ),
      );

      if (result.thread.unreadCount > 0) {
        const read = await markThreadReadAction(result.thread.id);
        if (cancelled || !read.ok) {
          return;
        }
        setThreads((current) =>
          current.map((thread) =>
            thread.id === result.thread.id
              ? { ...thread, unreadCount: 0 }
              : thread,
          ),
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return threads;
    }
    return threads.filter(
      (thread) =>
        thread.clientName.toLowerCase().includes(q) ||
        thread.clientEmail.toLowerCase().includes(q),
    );
  }, [query, threads]);

  const active = threads.find((thread) => thread.id === activeId) ?? null;

  function startConversation(clientId: string) {
    startTransition(async () => {
      const result = await createMessageThreadAction(clientId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setThreads((current) => {
        const without = current.filter(
          (thread) => thread.clientId !== result.thread.clientId,
        );
        return [result.thread, ...without];
      });
      setActiveId(result.thread.id);
    });
  }

  function send() {
    if (!active || !draft.trim()) {
      return;
    }

    const body = draft.trim();
    setDraft("");

    startTransition(async () => {
      const result = await sendMessageAction({
        threadId: active.id,
        author: "advisor",
        body,
      });

      if (!result.ok) {
        toast.error(result.message);
        setDraft(body);
        return;
      }

      setThreads((current) =>
        current
          .map((thread) => {
            if (thread.id !== active.id) {
              return thread;
            }

            return {
              ...thread,
              updatedAt: result.message.createdAt,
              lastMessage: result.message,
              unreadCount: 0,
              messages: [...thread.messages, result.message],
            };
          })
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
      );
    });
  }

  const unthreadedClients = clients.filter(
    (client) => !threads.some((thread) => thread.clientId === client.id),
  );

  return (
    <div className={dashboardTheme.page}>
      <section className="space-y-0.5">
        <SectionEyebrow>Inbox</SectionEyebrow>
        <h2 className={dashboardTheme.pageTitle}>Messages</h2>
        <p className={dashboardTheme.pageDescription}>
          Messages with clients. Team notes live on each client&apos;s Notes tab.
        </p>
      </section>

      <div className="grid min-h-[32rem] overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[20rem_1fr]">
        <aside className="flex flex-col border-b border-border lg:border-r lg:border-b-0">
          <div className="space-y-2 border-b border-border p-3">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
            />
            {unthreadedClients.length > 0 ? (
              <select
                className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
                defaultValue=""
                disabled={pending}
                onChange={(event) => {
                  if (event.target.value) {
                    startConversation(event.target.value);
                    event.target.value = "";
                  }
                }}
              >
                <option value="" disabled>
                  Start conversation…
                </option>
                {unthreadedClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
            ) : null}
          </div>

          <ul className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                No conversations yet.
              </li>
            ) : (
              filtered.map((thread) => {
                const [first, ...rest] = thread.clientName.split(" ");
                const last = rest.join(" ");
                return (
                  <li key={thread.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(thread.id)}
                      className={cn(
                        "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors duration-[var(--duration-press)] ease-[var(--ease-out)] hover:bg-muted/60",
                        activeId === thread.id && "bg-muted",
                      )}
                    >
                      <Avatar size="sm">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(first, last || first)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">
                            {thread.clientName}
                          </p>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {thread.unreadCount > 0 ? (
                              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                                {thread.unreadCount}
                              </span>
                            ) : null}
                            <span className="text-[10px] text-muted-foreground">
                              {formatDate(thread.updatedAt)}
                            </span>
                          </div>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {lastPreview(thread)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        <section className="flex min-h-[24rem] flex-col">
          {active ? (
            <>
              <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {active.clientName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {active.clientEmail}
                  </p>
                </div>
                <Link
                  href={`/clients/${active.clientId}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                  )}
                >
                  Open profile
                </Link>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {historyPending && active.messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Loading conversation…
                  </p>
                ) : active.messages.filter((m) => m.author !== "note").length ===
                  0 ? (
                  <p className="text-sm text-muted-foreground">
                    No messages yet. Write below.
                  </p>
                ) : (
                  active.messages
                    .filter((message) => message.author !== "note")
                    .map((message) => {
                    const isAdvisor = message.author === "advisor";
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          isAdvisor ? "justify-end" : "justify-start",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                            isAdvisor && "bg-primary text-primary-foreground",
                            !isAdvisor && "bg-muted text-foreground",
                          )}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "h-5 text-[10px]",
                                isAdvisor &&
                                  "border-transparent bg-white/15 text-primary-foreground",
                              )}
                            >
                              {isAdvisor ? "You" : "Client"}
                            </Badge>
                            <span
                              className={cn(
                                "text-[10px]",
                                isAdvisor
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground",
                              )}
                            >
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {message.body}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <footer className="border-t border-border p-3">
                <div className="space-y-2">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={3}
                    placeholder="Write to the client…"
                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={!draft.trim() || pending}
                      onClick={() => send()}
                    >
                      <Send />
                      Send
                    </Button>
                  </div>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
              Select a conversation or start one with a client from your book.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
