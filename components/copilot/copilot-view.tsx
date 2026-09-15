"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowUp, Square } from "lucide-react";
import { toast } from "sonner";

import { CelereyAiSymbol } from "@/components/brand/celerey-ai-symbol";
import { CELEREY_COPILOT_NAME } from "@/lib/celerey-copilot";
import { CopilotMarkdown } from "@/components/copilot/copilot-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { streamCopilotAnswer } from "@/lib/ai/stream-copilot-client";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Clients with reviews due in the next 14 days",
  "Relationships over cash mandate",
  "Open compliance items on my book",
  "Largest cash drag by segment",
  "Talking points for my next three reviews",
];

const COLUMN = "mx-auto w-full max-w-3xl";

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

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function CopilotView({ clients, scopeLabel }: CopilotViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [clientId, setClientId] = useState("all");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isEmpty = messages.length === 0;

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (isEmpty) {
      return;
    }

    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
    });
  }, [isEmpty, messages]);

  function stop() {
    abortRef.current?.abort();
  }

  async function ask(prompt: string) {
    const text = prompt.trim();

    if (!text || isStreaming) {
      return;
    }

    const assistantId = `assistant-${crypto.randomUUID()}`;
    const controller = new AbortController();

    abortRef.current?.abort();
    abortRef.current = controller;

    setMessages((current) => [
      ...current,
      { id: `user-${crypto.randomUUID()}`, role: "user", content: text },
      {
        id: assistantId,
        role: "assistant",
        content: "",
        streaming: true,
      },
    ]);
    setQuestion("");
    setIsStreaming(true);
    textareaRef.current?.focus();

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
        controller.signal,
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
      if (isAbortError(error) || controller.signal.aborted) {
        setMessages((current) => {
          const assistant = current.find(
            (message) => message.id === assistantId,
          );

          if (!assistant?.content) {
            return current.filter((message) => message.id !== assistantId);
          }

          return current.map((message) =>
            message.id === assistantId
              ? { ...message, streaming: false }
              : message,
          );
        });
        return;
      }

      setMessages((current) =>
        current.filter((message) => message.id !== assistantId),
      );
      toast.error(
        error instanceof Error
          ? error.message
          : `${CELEREY_COPILOT_NAME} could not complete that request.`,
      );
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setIsStreaming(false);
    }
  }

  const composer = (
    <CopilotComposer
      clients={clients}
      clientId={clientId}
      onClientIdChange={setClientId}
      question={question}
      onQuestionChange={setQuestion}
      isStreaming={isStreaming}
      textareaRef={textareaRef}
      onAsk={() => void ask(question)}
      onStop={stop}
    />
  );

  return (
    <div
      className={cn(
        dashboardTheme.page,
        "flex h-[calc(100svh-3.5rem)] flex-col",
      )}
    >
      {isEmpty ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
          <div className={cn(COLUMN, "flex flex-1 flex-col justify-center py-10")}>
            <div className="brand-enter mb-8 text-center">
              <CelereyAiSymbol
                size="hero"
                className="mx-auto mb-4 size-[4.5rem] sm:size-20"
              />
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-accent-purple">
                {CELEREY_COPILOT_NAME}
              </p>
              <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
                What do you want to look at?
              </h1>
            </div>

            {composer}

            <div className="brand-stagger mt-4 grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  disabled={isStreaming}
                  className="h-auto justify-start whitespace-normal px-4 py-3 text-left font-normal text-foreground"
                  onClick={() => void ask(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
            <div className={cn(COLUMN, "space-y-8 px-4 py-8")}>
              {messages.map((message) =>
                message.role === "user" ? (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="space-y-2">
                    {message.offline ? (
                      <Badge variant="outline" className="text-xs">
                        Offline draft
                      </Badge>
                    ) : null}
                    {message.content ? (
                      <CopilotMarkdown content={message.content} />
                    ) : (
                      <span
                        className="inline-block size-2 rounded-full bg-foreground/40 motion-safe:animate-pulse"
                        aria-label="Generating"
                      />
                    )}
                    {message.streaming && message.content ? (
                      <span
                        className="ml-0.5 inline-block h-4 w-0.5 bg-foreground/50 align-middle motion-safe:animate-pulse"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="shrink-0 px-4 pb-2 pt-2">
            <div className={COLUMN}>{composer}</div>
          </div>
        </>
      )}

      <p className="shrink-0 px-4 pb-4 text-center text-xs text-muted-foreground">
        Uses {scopeLabel}. Check it before a client sees it.
      </p>
    </div>
  );
}

type CopilotComposerProps = {
  clients: Array<{ id: string; name: string }>;
  clientId: string;
  onClientIdChange: (value: string) => void;
  question: string;
  onQuestionChange: (value: string) => void;
  isStreaming: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onAsk: () => void;
  onStop: () => void;
};

function CopilotComposer({
  clients,
  clientId,
  onClientIdChange,
  question,
  onQuestionChange,
  isStreaming,
  textareaRef,
  onAsk,
  onStop,
}: CopilotComposerProps) {
  const canSend = question.trim().length > 0 && !isStreaming;

  return (
    <div className="rounded-3xl border border-border/70 bg-card shadow-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
      <Textarea
        ref={textareaRef}
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) {
            return;
          }

          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onAsk();
          }
        }}
        placeholder="Ask about a client or your book"
        rows={1}
        autoFocus
        className="max-h-40 min-h-[52px] resize-none border-0 bg-transparent px-4 pt-3.5 pb-1 shadow-none focus-visible:ring-0"
      />
      <div className="flex items-center justify-between gap-2 px-2 pb-2">
        <Select
          value={clientId}
          onValueChange={(value) => onClientIdChange(value ?? "all")}
        >
          <SelectTrigger
            size="sm"
            aria-label="Narrow to a client"
            className="max-w-[200px] text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            <SelectItem value="all">Whole book</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isStreaming ? (
          <Button
            type="button"
            size="icon-sm"
            aria-label="Stop generating"
            className="rounded-full"
            onClick={onStop}
          >
            <Square className="fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon-sm"
            aria-label="Send"
            disabled={!canSend}
            className="rounded-full"
            onClick={onAsk}
          >
            <ArrowUp />
          </Button>
        )}
      </div>
    </div>
  );
}
