import "server-only";

import sampleClientData from "@/lib/data/sample-client-data.json";
import { clients } from "@/lib/data/clients";
import type { Client, ClientSubscription } from "@/types/client";
import type { ClientDetail, ClientDetailState } from "@/types/client-detail";

const sample = {
  state: sampleClientData.state as unknown as ClientDetailState,
};

function cloneState(state: ClientDetailState): ClientDetailState {
  return structuredClone(state);
}

function overlayIdentity(
  state: ClientDetailState,
  client: Client,
): ClientDetailState {
  const next = cloneState(state);
  const [countryHint] = client.location.split(",").map((part) => part.trim());

  next.user = {
    ...next.user,
    user_id: client.id,
    email: client.email,
    first_name: client.firstName,
    last_name: client.lastName,
    display_name: `${client.firstName} ${client.lastName}`,
    phone_number: client.phone || next.user.phone_number,
    city: countryHint || next.user.city,
    currency: client.currency,
    risk_profile: client.riskLevel,
    is_active: client.status !== "inactive",
    created_at: client.joinedAt,
    updated_at: client.lastContactAt,
  };

  if (client.id !== "cli_002") {
    next.user.bio = `${client.firstName} is an advisory client based in ${client.location}. Profile data below is demo-filled from the Celerey sample book so advisors can review the full workspace shape.`;
    next.cashFlowSummary = {
      ...next.cashFlowSummary,
      currency: client.currency,
    };
  }

  return next;
}

function buildDetail(client: Client): ClientDetail {
  return {
    id: client.id,
    subscription: client.subscription,
    state: overlayIdentity(sample.state, client),
  };
}

/** Mutable in-memory detail store for the demo foundation. */
export const clientDetailsById: Record<string, ClientDetail> = Object.fromEntries(
  clients.map((client) => [client.id, buildDetail(client)]),
);

export function ensureClientDetail(client: Client): ClientDetail {
  const existing = clientDetailsById[client.id];
  if (existing) {
    return existing;
  }

  const created = buildDetail(client);
  clientDetailsById[client.id] = created;
  return created;
}

export function updateDetailSubscription(
  id: string,
  subscription: ClientSubscription,
): ClientDetail | null {
  const detail = clientDetailsById[id];
  if (!detail) {
    return null;
  }

  detail.subscription = subscription;
  return detail;
}

export function computeAua(state: ClientDetailState): number {
  const holdings = state.holdings.reduce(
    (sum, holding) => sum + (Number(holding.current_value) || 0),
    0,
  );
  const accounts = state.accounts.reduce(
    (sum, account) => sum + (Number(account.balance) || 0),
    0,
  );
  const property = state.propertyAssets.reduce((sum, asset) => {
    const value =
      Number(asset.market_value) ||
      Number(asset.current_value) ||
      Number(asset.purchase_price) ||
      0;
    return sum + value;
  }, 0);

  return Math.round(holdings + accounts + property);
}
