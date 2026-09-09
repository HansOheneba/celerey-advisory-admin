"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Square } from "lucide-react";
import { toast } from "sonner";

import { CopilotMarkdown } from "@/components/copilot/copilot-markdown";
import { IconTile } from "@/components/shared/icon-tile";
import { PageHeader } from "@/components/shared/page-header";
import { SectionPanel } from "@/components/shared/section-panel";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { streamCopilotAnswer } from "@/lib/ai/stream-copilot-client";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Clients with reviews due in the next 14 days",
  "Relationships over cash mandate",
  "Open compliance items on my book",
  "Largest cash drag by segment",
  "Talking points for my next three reviews",
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  offline?: boolean;
  streaming?: boolean;
};

type CopilotViewProps = {
  clients: Array<{ id: string; name: string }>;
  scopeLabel: string;
};

export function CopilotView({ clients, scopeLabel }: CopilotViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [clientId, setClientId] = useState("all");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function ask(prompt: string) {
    const text = prompt.trim();

    if (!text || isStreaming) {
      return;
    }

    const assistantId = `assistant-${Date.now()}`;

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content: text },
      {
        id: assistantId,
        role: "assistant",
        content: "",
        streaming: true,
      },
    ]);
    setQuestion("");
    setIsStreaming(true);

    try {
      const { content, offline } = await streamCopilotAnswer(
        text,
        clientId === "all" ? undefined : clientId,
        (partial) => {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? { ...message, content: partial }
                : message,
            ),
          );
        },
      );

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content,
                offline,
                streaming: false,
              }
            : message,
        ),
      );
    } catch (error) {
      setMessages((current) =>
        current.filter((message) => message.id !== assistantId),
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Copilot could not complete that request.",
      );
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className={cn(dashboardTheme.pageContainerNarrow, "flex flex-col")}>
      <PageHeader
        eyebrow="Copilot"
        title="Book-wide queries"
        description={`Uses ${scopeLabel} data only. Verify before sharing with a client.`}
        icon={Sparkles}
        iconVariant="ai"
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <Card
          className={cn(
            "flex min-h-[min(72vh,720px)] flex-col shadow-none",
            dashboardTheme.tintedSurface.ai,
          )}
        >
          <CardHeader className="shrink-0 border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4" aria-hidden />
              Conversation
            </CardTitle>
            <CardDescription>
              Answers stream in as they are generated. Citations come from your
              book data — verify before sharing with a client.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5"
            >
              {messages.length === 0 ? (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-2 text-center">
                  <IconTile icon={Sparkles} variant="ai" size="lg" />
                  <p className="text-sm font-medium">Start with a question</p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Ask about a client, segment, compliance item, or draft
                    material for an upcoming review.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) =>
                    message.role === "user" ? (
                      <div key={message.id} className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div key={message.id} className="flex gap-3">
                        <IconTile icon={Sparkles} variant="ai" size="sm" />
                        <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                          {message.offline ? (
                            <Badge variant="outline" className="text-xs">
                              Offline draft
                            </Badge>
                          ) : null}
                          <div className="rounded-2xl rounded-tl-md border border-border/50 bg-background px-4 py-3">
                            {message.content ? (
                              <CopilotMarkdown content={message.content} />
                            ) : message.streaming ? (
                              <p className="text-sm text-muted-foreground">
                                Fetching data…
                              </p>
                            ) : null}
                            {message.streaming && message.content ? (
                              <span
                                className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-foreground/50 align-middle"
                                aria-hidden
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 space-y-3 border-t border-border/50 p-4">
              <Select
                value={clientId}
                onValueChange={(value) => setClientId(value ?? "all")}
                disabled={isStreaming}
              >
                <SelectTrigger aria-label="Narrow to a client">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Whole book</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative rounded-xl border border-border/60 bg-background shadow-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
                <Textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void ask(question);
                    }
                  }}
                  placeholder="Ask about a client or your book…"
                  rows={3}
                  disabled={isStreaming}
                  className="min-h-[88px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
                <div className="flex items-center justify-between gap-2 px-3 pb-3">
                  <p className="text-xs text-muted-foreground">
                    Enter to send · Shift+Enter for a new line
                  </p>
                  <Button
                    size="sm"
                    onClick={() => void ask(question)}
                    disabled={isStreaming || !question.trim()}
                  >
                    {isStreaming ? <Square className="fill-current" /> : <Send />}
                    {isStreaming ? "Streaming…" : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <SectionPanel title="Suggested questions" variant="ai" className="h-fit">
          <div className="space-y-2">
            {SUGGESTIONS.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                disabled={isStreaming}
                className={cn(
                  "h-auto w-full justify-start whitespace-normal border-[var(--accent-purple)]/20 bg-background/80 py-2 text-left",
                )}
                onClick={() => void ask(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
