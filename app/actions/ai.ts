"use server";

import { revalidatePath } from "next/cache";

import { celereyCopilotAccessDeniedMessage } from "@/lib/celerey-copilot";
import {
  ADVISORY_SYSTEM_PROMPT,
  BOOK_CONTEXT_SCOPES,
  CLIENT_CONTEXT_SCOPES,
  buildBookContext,
  buildClientContext,
  fallbackBookAnswer,
  fallbackClientBrief,
} from "@/lib/ai/context";
import { chatCompletion } from "@/lib/ai/deepseek";
import { can } from "@/lib/auth/capabilities";
import { requireSession } from "@/lib/dal";
import {
  getAlertFeed,
  getBookMetrics,
  getClientRecord,
  getOpportunityFeed,
  getRecommendations,
  getScopedClientRecords,
} from "@/lib/demo/repositories";
import { mutateDemoDb } from "@/lib/demo/store";

export type CopilotMode =
  | "client_brief"
  | "meeting_prep"
  | "portfolio_review"
  | "book_question";

export type CopilotResult = {
  content: string;
  /** True when the answer came from the rule engine rather than DeepSeek. */
  offline: boolean;
};

const MODE_INSTRUCTIONS: Record<CopilotMode, string> = {
  client_brief:
    "Write a relationship brief in three short sections: what changed since the last review, why it matters for this client, and the three actions to take next. Keep it under 300 words.",
  meeting_prep:
    "Write meeting preparation notes: the agenda in four bullets, the two questions the client is most likely to ask with suggested answers, and the single outcome to secure from the meeting.",
  portfolio_review:
    "Write a portfolio commentary: current positioning against the mandate, the drivers of the trailing return, the specific risks in the current allocation, and the rebalancing steps you recommend.",
  book_question:
    "Answer the question using only the book data supplied. Lead with the direct answer, then give the supporting numbers and name the specific clients involved.",
};

async function recordAiSession(input: {
  userId: string;
  userName: string;
  role: string;
  mode: CopilotMode;
  clientId: string | null;
  prompt: string;
  response: string;
  contextScopes: string[];
}) {
  await mutateDemoDb((db) => {
    db.aiSessions.unshift({
      id: `ai-${Date.now().toString(36)}`,
      userId: input.userId,
      userName: input.userName,
      role: input.role,
      mode: input.mode,
      clientId: input.clientId,
      prompt: input.prompt,
      response: input.response,
      createdAt: new Date().toISOString(),
      contextScopes: input.contextScopes,
    });

    db.aiSessions = db.aiSessions.slice(0, 100);
  });
}

/** Generate a narrative for one client, grounded in that client's data only. */
export async function generateClientNarrative(
  clientId: string,
  mode: CopilotMode = "client_brief",
): Promise<CopilotResult> {
  const session = await requireSession();

  if (!can(session.demoRole, "use_copilot")) {
    return {
      content: celereyCopilotAccessDeniedMessage(),
      offline: true,
    };
  }

  const record = await getClientRecord(clientId);

  if (!record) {
    return {
      content: "That client is not in your book.",
      offline: true,
    };
  }

  const context = buildClientContext(record);
  const instruction = MODE_INSTRUCTIONS[mode];

  const result = await chatCompletion([
    { role: "system", content: ADVISORY_SYSTEM_PROMPT },
    { role: "user", content: `${instruction}\n\n${context}` },
  ]);

  const content = result.ok ? result.content : fallbackClientBrief(record);

  await recordAiSession({
    userId: session.userId,
    userName: session.name,
    role: session.capabilities.label,
    mode,
    clientId,
    prompt: instruction,
    response: content,
    contextScopes: CLIENT_CONTEXT_SCOPES,
  });

  revalidatePath("/insights");

  return { content, offline: !result.ok };
}

/** Answer a free-form question about the whole visible book. */
export async function askCopilot(
  question: string,
  clientId?: string,
): Promise<CopilotResult> {
  const session = await requireSession();

  if (!can(session.demoRole, "use_copilot")) {
    return {
      content: celereyCopilotAccessDeniedMessage(),
      offline: true,
    };
  }

  const trimmed = question.trim();

  if (!trimmed) {
    return { content: "Ask a question to get started.", offline: true };
  }

  if (clientId) {
    const record = await getClientRecord(clientId);

    if (record) {
      const result = await chatCompletion([
        { role: "system", content: ADVISORY_SYSTEM_PROMPT },
        {
          role: "user",
          content: `${trimmed}\n\n${buildClientContext(record)}`,
        },
      ]);

      const content = result.ok
        ? result.content
        : fallbackClientBrief(record);

      await recordAiSession({
        userId: session.userId,
        userName: session.name,
        role: session.capabilities.label,
        mode: "book_question",
        clientId,
        prompt: trimmed,
        response: content,
        contextScopes: CLIENT_CONTEXT_SCOPES,
      });

      revalidatePath("/insights");
      return { content, offline: !result.ok };
    }
  }

  const [records, metrics, alerts, opportunities, recommendations] =
    await Promise.all([
      getScopedClientRecords(),
      getBookMetrics(),
      getAlertFeed(),
      getOpportunityFeed(),
      getRecommendations(),
    ]);

  const context = buildBookContext(
    records,
    metrics,
    alerts,
    opportunities,
    recommendations,
  );

  const result = await chatCompletion([
    { role: "system", content: ADVISORY_SYSTEM_PROMPT },
    {
      role: "user",
      content: `${MODE_INSTRUCTIONS.book_question}\n\nQuestion: ${trimmed}\n\n${context}`,
    },
  ]);

  const content = result.ok
    ? result.content
    : fallbackBookAnswer(trimmed, metrics, alerts, opportunities);

  await recordAiSession({
    userId: session.userId,
    userName: session.name,
    role: session.capabilities.label,
    mode: "book_question",
    clientId: null,
    prompt: trimmed,
    response: content,
    contextScopes: BOOK_CONTEXT_SCOPES,
  });

  revalidatePath("/insights");

  return { content, offline: !result.ok };
}
