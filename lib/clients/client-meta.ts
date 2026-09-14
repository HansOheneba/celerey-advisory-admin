import { subscriptionLabel } from "@/components/clients/subscription-badge";
import { CLIENT_SEGMENT_LABELS, type ClientSegment } from "@/types/client";
import { titleCase } from "@/lib/format";
import type { Client, ClientStatus } from "@/types/client";

const ATTENTION_STATUSES = new Set<ClientStatus>([
  "review",
  "onboarding",
  "inactive",
]);

export function clientNeedsStatusHighlight(status: ClientStatus): boolean {
  return ATTENTION_STATUSES.has(status);
}

export function buildClientMetaParts(
  client: Client,
  segment?: ClientSegment,
): string[] {
  const parts: string[] = [];

  const resolvedSegment = segment ?? client.segment;
  if (resolvedSegment) {
    parts.push(CLIENT_SEGMENT_LABELS[resolvedSegment]);
  }

  parts.push(titleCase(client.riskLevel));
  parts.push(subscriptionLabel(client.subscription));

  if (clientNeedsStatusHighlight(client.status)) {
    parts.push(titleCase(client.status));
  }

  if (client.location) {
    parts.push(client.location);
  }

  return parts;
}
