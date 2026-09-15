"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createMessageThreadAction,
  sendMessageAction,
} from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ConversationThread } from "@/lib/messages/types";

/** Starters the RM can drop into the composer and edit before sending. */
const TEMPLATES: Array<{ label: string; body: string }> = [
  {
    label: "Review invitation",
    body: "Can we book your next review? I'll bring performance, cash, and where each goal stands. What week works?",
  },
  {
    label: "Cash deployment",
    body: "Cash is above what we agreed, so you're giving up return. I mapped a staged deploy that keeps near-term liquidity. Want me to send it?",
  },
  {
    label: "Rebalance notice",
    body: "Markets moved you off the profile we set. I'd bring allocation back to target. Trades and rationale are ready if you want them.",
  },
  {
    label: "Maturity reminder",
    body: "A holding matures soon. I lined up two reinvest options that stay inside your risk band.",
  },
];

type CommsTabProps = {
  clientId: string;
  clientName: string;
  thread: ConversationThread | null;
  canMessage: boolean;
};

export function CommsTab({
  clientId,
  clientName,
  thread,
  canMessage,
}: CommsTabProps) {
  const visibleMessages = (thread?.messages ?? []).filter(
    (message) => message.author !== "note",
  );
  const [messages, setMessages] = useState(visibleMessages);
  const [threadId, setThreadId] = useState(thread?.id ?? null);
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  function send() {
    const text = body.trim();
    if (!text) return;

    startTransition(async () => {
      let activeThreadId = threadId;

      if (!activeThreadId) {
        const created = await createMessageThreadAction(clientId);

        if (!created.ok) {
          toast.error(created.message);
          return;
        }

        activeThreadId = created.thread.id;
        setThreadId(activeThreadId);
      }

      const result = await sendMessageAction({
        threadId: activeThreadId,
        author: "advisor",
        body: text,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setMessages((current) => [...current, result.message]);
      setBody("");
      toast.success("Sent");
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Conversation with {clientName}</CardTitle>
          <CardDescription>
            {messages.length} message{messages.length === 1 ? "" : "s"} with
            the client.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-[420px] space-y-3 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No messages yet. Write below.
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[85%] rounded-lg p-3 text-sm leading-relaxed",
                    message.author === "client" &&
                      "border border-border bg-card",
                    message.author === "advisor" &&
                      "ml-auto bg-primary text-primary-foreground",
                  )}
                >
                  <p>{message.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      message.author === "advisor"
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>

          {canMessage ? (
            <div className="space-y-2 border-t border-border pt-3">
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder={`Write to ${clientName}…`}
                rows={3}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={send} disabled={isPending || !body.trim()}>
                  Send message
                </Button>
              </div>
            </div>
          ) : (
            <p className="border-t border-border pt-3 text-sm text-muted-foreground">
              Read-only for your role.
            </p>
          )}
        </CardContent>
      </Card>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>Edit before you send.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {TEMPLATES.map((template) => (
            <Button
              key={template.label}
              variant="outline"
              size="sm"
              className="h-auto w-full justify-start py-2 text-left"
              disabled={!canMessage}
              onClick={() => setBody(template.body)}
            >
              {template.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
