/**
 * Client contact and review cadence.
 *
 * Last contact
 * -----------
 * `lastContactAt` is the most recent advisor↔client touchpoint that counts as
 * meaningful engagement. It is updated only through `recordClientContact`.
 *
 * Counts as contact:
 * - Advisor or client message in a client thread (not internal advisor notes)
 * - Completed advisory session (`admin.appointments.log`)
 *
 * Does NOT count as contact:
 * - Internal advisor notes on a message thread
 * - Profile or portfolio data updates without a conversation
 * - Published meeting notes without a logged session
 * - System-generated onboarding placeholders (seed/demo only)
 *
 * Next review
 * -----------
 * `reviewFrequencyDays` is set per client (typically by segment at onboarding).
 * `nextReviewAt` is the scheduled review date; when a qualifying contact occurs,
 * the next review can be rolled forward by `reviewFrequencyDays` from that touch.
 */

import type { ClientSegment, DemoClientRecord } from "@/lib/demo/types";
import type { Client } from "@/types/client";

export type LastContactSource =
  | "message"
  | "session_logged"
  | "onboarding"
  | "seed";

export const LAST_CONTACT_SOURCE_LABELS: Record<LastContactSource, string> = {
  message: "Client or advisor message",
  session_logged: "Completed advisory session",
  onboarding: "Client created at onboarding",
  seed: "Demo seed data",
};

/** Default review cadence in days by client segment. */
export const REVIEW_FREQUENCY_DAYS: Record<ClientSegment, number> = {
  uhnw: 90,
  hnw: 180,
  affluent: 180,
  emerging: 365,
};

export function reviewFrequencyForSegment(segment: ClientSegment): number {
  return REVIEW_FREQUENCY_DAYS[segment];
}

export function computeNextReviewAt(
  fromIso: string,
  reviewFrequencyDays: number,
): string {
  const base = Date.parse(fromIso);
  const from = Number.isFinite(base) ? base : Date.now();
  return new Date(
    from + reviewFrequencyDays * 24 * 60 * 60 * 1000,
  ).toISOString();
}

export function daysSince(iso: string, now = Date.now()): number {
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.floor((now - parsed) / (24 * 60 * 60 * 1000)));
}

export function recordClientContact(
  record: Pick<DemoClientRecord, "client" | "lastEngagementDays">,
  at: string,
  source: LastContactSource,
  detail?: string,
): void {
  record.client.lastContactAt = at;
  record.client.lastContactSource = source;
  record.lastEngagementDays = daysSince(at);

  if (record.client.reviewFrequencyDays > 0) {
    record.client.nextReviewAt = computeNextReviewAt(
      at,
      record.client.reviewFrequencyDays,
    );
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[lastContact]", {
      clientId: record.client.id,
      at,
      source,
      sourceLabel: LAST_CONTACT_SOURCE_LABELS[source],
      detail,
      nextReviewAt: record.client.nextReviewAt,
      rules:
        "Counts: client/advisor messages (not notes), completed sessions. Does not count: profile updates, notes-only, unpublished drafts.",
    });
  }
}

export function formatLastContactProvenance(client: Client): string {
  if (!client.lastContactSource) {
    return "Source not recorded";
  }
  return LAST_CONTACT_SOURCE_LABELS[client.lastContactSource];
}
