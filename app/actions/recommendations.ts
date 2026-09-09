"use server";

import { revalidatePath } from "next/cache";

import { can } from "@/lib/auth/capabilities";
import { requireSession } from "@/lib/dal";
import { getClientRecord } from "@/lib/demo/repositories";
import { productById } from "@/lib/demo/seed/products";
import { mutateDemoDb } from "@/lib/demo/store";
import type { RecommendationStatus } from "@/lib/demo/types";

export type RecommendationActionResult =
  | { ok: true }
  | { ok: false; message: string };

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * An RM proposes; it enters the compliance queue rather than going live. This
 * is the control the spec requires between advice and execution.
 */
export async function proposeRecommendation(input: {
  clientId: string;
  title: string;
  rationale: string;
  productId: string | null;
  amountUsd: number;
}): Promise<RecommendationActionResult> {
  const session = await requireSession();

  if (!can(session.demoRole, "propose_recommendation")) {
    return { ok: false, message: "Your role cannot propose recommendations." };
  }

  const record = await getClientRecord(input.clientId);

  if (!record) {
    return { ok: false, message: "That client is not in your book." };
  }

  const title = input.title.trim();

  if (!title) {
    return { ok: false, message: "Give the recommendation a title." };
  }

  const product = input.productId ? productById(input.productId) : null;

  if (input.productId && !product) {
    return { ok: false, message: "Unknown product." };
  }

  const now = new Date().toISOString();

  await mutateDemoDb((db) => {
    db.recommendations.unshift({
      id: newId("rec"),
      clientId: input.clientId,
      clientName: `${record.client.firstName} ${record.client.lastName}`,
      title,
      rationale: input.rationale.trim(),
      productId: input.productId,
      amountUsd: input.amountUsd,
      status: "pending_compliance",
      proposedBy: session.userId,
      proposedByName: session.name,
      decidedBy: null,
      decidedByName: null,
      decisionNote: null,
      createdAt: now,
      updatedAt: now,
    });

    db.auditLogs.unshift({
      id: newId("audit"),
      actorId: session.userId,
      actorName: session.name,
      action: "recommendation.proposed",
      targetType: "client",
      targetId: input.clientId,
      targetLabel: title,
      occurredAt: now,
    });
  });

  revalidatePath(`/clients/${input.clientId}`);
  revalidatePath("/insights");

  return { ok: true };
}

/** Compliance and Team Leads approve or block; Portfolio Officers execute. */
export async function decideRecommendation(input: {
  recommendationId: string;
  decision: Extract<
    RecommendationStatus,
    "approved" | "blocked" | "executed"
  >;
  note: string;
}): Promise<RecommendationActionResult> {
  const session = await requireSession();

  const permitted =
    input.decision === "executed"
      ? can(session.demoRole, "execute_trade")
      : can(session.demoRole, "approve_recommendation");

  if (!permitted) {
    return {
      ok: false,
      message:
        input.decision === "executed"
          ? "Only a Portfolio Officer can execute."
          : "Your role cannot approve or block recommendations.",
    };
  }

  const now = new Date().toISOString();
  let clientId: string | null = null;

  const applied = await mutateDemoDb((db) => {
    const recommendation = db.recommendations.find(
      (candidate) => candidate.id === input.recommendationId,
    );

    if (!recommendation) {
      return false;
    }

    if (input.decision === "executed" && recommendation.status !== "approved") {
      return false;
    }

    recommendation.status = input.decision;
    recommendation.decidedBy = session.userId;
    recommendation.decidedByName = session.name;
    recommendation.decisionNote = input.note.trim() || null;
    recommendation.updatedAt = now;
    clientId = recommendation.clientId;

    db.auditLogs.unshift({
      id: newId("audit"),
      actorId: session.userId,
      actorName: session.name,
      action: `recommendation.${input.decision}`,
      targetType: "recommendation",
      targetId: recommendation.id,
      targetLabel: `${recommendation.title} — ${recommendation.clientName}`,
      occurredAt: now,
    });

    return true;
  });

  if (!applied) {
    return {
      ok: false,
      message:
        input.decision === "executed"
          ? "Only approved recommendations can be executed."
          : "Recommendation not found.",
    };
  }

  if (clientId) {
    revalidatePath(`/clients/${clientId}`);
  }
  revalidatePath("/insights");

  return { ok: true };
}
