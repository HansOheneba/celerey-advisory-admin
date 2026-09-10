"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createMessageThreadAction,
  sendMessageAction,
} from "@/app/actions/messages";
import { Badge } from "@/components/ui/badge";
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
    body: "I would like to book your next portfolio review. I will bring an updated performance summary, a view on your cash weighting and the funding position of each goal. Which week suits you?",
  },
  {
    label: "Cash deployment",
    body: "Your cash weighting has moved above the level we agreed, which is costing return. I have modelled a staged deployment so we keep your near-term liquidity intact. Shall I send the detail?",
  },
  {
    label: "Rebalance notice",
    body: "Following recent market moves your allocation has drifted from the profile we agreed. I recommend we bring it back to target. I have prepared the trades and the rationale for your approval.",
  },
  {
    label: "Maturity reminder",
    body: "One of your holdings matures shortly. Rather than leave the proceeds in cash, I have set out two reinvestment options that stay within your agreed risk profile.",
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
  const [messages, setMessages] = useState(thread?.messages ?? []);
  const [threadId, setThreadId] = useState(thread?.id ?? null);
  const [body, setBody] = useState("");
  const [isNote, setIsNote] = useState(false);
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
        author: isNote ? "note" : "advisor",
        body: text,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setMessages((current) => [...current, result.message]);
      setBody("");
      toast.success(isNote ? "Note added." : "Message sent.");
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Conversation with {clientName}</CardTitle>
          <CardDescription>
            {messages.length} message{messages.length === 1 ? "" : "s"}. Notes
            stay internal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-[420px] space-y-3 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation below.
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
                    message.author === "note" &&
                      "border border-dashed border-amber-500/40 bg-amber-500/5",
                  )}
                >
                  {message.author === "note" ? (
                    <Badge variant="outline" className="mb-1.5">
                      Internal note
                    </Badge>
                  ) : null}
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
                placeholder={
                  isNote
                    ? "Record an internal note for the file."
                    : `Write to ${clientName}…`
                }
                rows={3}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={send} disabled={isPending || !body.trim()}>
                  {isNote ? "Save note" : "Send message"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsNote((current) => !current)}
                >
                  {isNote ? "Switch to message" : "Switch to internal note"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="border-t border-border pt-3 text-sm text-muted-foreground">
              Your role has read-only access to client communications.
            </p>
          )}
        </CardContent>
      </Card>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>Edit before sending.</CardDescription>
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
