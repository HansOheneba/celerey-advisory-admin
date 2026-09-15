import "server-only";

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
import { COPILOT_BOOK_QUESTION_INSTRUCTION } from "@/lib/ai/copilot-voice";
import type { ChatMessage } from "@/lib/ai/deepseek";
import { can } from "@/lib/auth/capabilities";
import type { AdvisorSession } from "@/lib/dal";
import {
  getAlertFeed,
  getBookMetrics,
  getClientRecord,
  getOpportunityFeed,
  getRecommendations,
  getScopedClientRecords,
} from "@/lib/demo/repositories";

export type CopilotRequestPayload = {
  messages: ChatMessage[];
  prompt: string;
  clientId: string | null;
  contextScopes: string[];
  resolveFallback: () => Promise<string> | string;
};

export type CopilotRequestResult =
  | { ok: true; payload: CopilotRequestPayload }
  | { ok: false; message: string };

export async function prepareCopilotRequest(
  session: AdvisorSession,
  question: string,
  clientId?: string,
): Promise<CopilotRequestResult> {
  if (!can(session.demoRole, "use_copilot")) {
    return {
      ok: false,
      message: celereyCopilotAccessDeniedMessage(),
    };
  }

  const trimmed = question.trim();

  if (!trimmed) {
    return { ok: false, message: "Ask a question to get started." };
  }

  if (clientId) {
    const record = await getClientRecord(clientId);

    if (record) {
      return {
        ok: true,
        payload: {
          messages: [
            { role: "system", content: ADVISORY_SYSTEM_PROMPT },
            {
              role: "user",
              content: `${trimmed}\n\n${buildClientContext(record)}`,
            },
          ],
          prompt: trimmed,
          clientId,
          contextScopes: CLIENT_CONTEXT_SCOPES,
          resolveFallback: () => fallbackClientBrief(record),
        },
      };
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

  return {
    ok: true,
    payload: {
      messages: [
        { role: "system", content: ADVISORY_SYSTEM_PROMPT },
        {
          role: "user",
          content: `${COPILOT_BOOK_QUESTION_INSTRUCTION}\n\nQuestion: ${trimmed}\n\n${context}`,
        },
      ],
      prompt: trimmed,
      clientId: clientId ?? null,
      contextScopes: BOOK_CONTEXT_SCOPES,
      resolveFallback: () =>
        fallbackBookAnswer(trimmed, metrics, alerts, opportunities),
    },
  };
}
