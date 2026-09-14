import type { AuditLogEntry } from "@/lib/settings/audit";
import type { Appointment, AdvisoryEntitlement } from "@/lib/appointments/types";
import type { ClientAvailability } from "@/lib/availability/types";
import type { ClientDocument } from "@/lib/documents/types";
import type { ConversationThread } from "@/lib/messages/types";
import type { AdvisorSettings } from "@/lib/settings/local-store";
import type { Task } from "@/lib/tasks/types";
import type { Advisor } from "@/types/advisor";
import type {
  Client,
  ClientActivity,
  ClientSegment,
  ClientSubscription,
} from "@/types/client";
export type { ClientSegment } from "@/types/client";
export { CLIENT_SEGMENT_LABELS } from "@/types/client";
import type { ClientInternalNote } from "@/types/client-internal-note";
import type { ClientDetailState } from "@/types/client-detail";

export type AlertSeverity = "critical" | "warning" | "info";

export type AlertKind =
  | "risk_breach"
  | "review_overdue"
  | "idle_cash"
  | "goal_gap"
  | "maturity"
  | "escalation"
  | "client_message"
  | "document_uploaded"
  | "task_due"
  | "client_assigned"
  | "report_ready";

/**
 * A single attention item. Alerts are both the Overview "Alerts & attention"
 * column and the notification feed in the top bar — one source, two surfaces.
 */
export type DemoAlert = {
  id: string;
  kind: AlertKind;
  severity: AlertSeverity;
  title: string;
  detail: string;
  clientId: string | null;
  clientName: string | null;
  advisorId: string | null;
  /** Workspace tab to land on when the alert is opened. */
  workspaceTab?: string;
  createdAt: string;
  read: boolean;
};

export type OpportunityKind =
  | "cash_deployment"
  | "rebalancing"
  | "lending"
  | "held_away"
  | "maturing"
  | "relationship_deepening";

export const OPPORTUNITY_LABELS: Record<OpportunityKind, string> = {
  cash_deployment: "Cash deployment",
  rebalancing: "Rebalancing",
  lending: "Lending / Lombard",
  held_away: "Assets held away",
  maturing: "Maturing investments",
  relationship_deepening: "Relationship deepening",
};

export type DemoOpportunity = {
  id: string;
  kind: OpportunityKind;
  clientId: string;
  clientName: string;
  advisorId: string;
  /** Estimated revenue or deployable value in USD. */
  valueUsd: number;
  rationale: string;
  suggestedProductIds: string[];
};

/**
 * Intelligence card in the wireframe's "what changed & why it matters"
 * format. Rule-derived by default; the copilot can regenerate the narrative.
 */
export type IntelligenceCard = {
  id: string;
  what: string;
  why: string;
  action: string;
  severity: AlertSeverity;
  /** Present when the insight points at a concrete opportunity. */
  opportunityKind?: OpportunityKind;
};

export type SuitabilityVerdict = "suitable" | "blocked" | "review";

export type SuitabilityCheck = {
  id: string;
  action: string;
  verdict: SuitabilityVerdict;
  reason: string;
};

export type RecommendationStatus =
  | "draft"
  | "proposed"
  | "pending_compliance"
  | "approved"
  | "blocked"
  | "executed";

export const RECOMMENDATION_STATUS_LABELS: Record<
  RecommendationStatus,
  string
> = {
  draft: "Draft",
  proposed: "Proposed",
  pending_compliance: "Pending compliance",
  approved: "Approved",
  blocked: "Blocked",
  executed: "Executed",
};

export type DemoRecommendation = {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  rationale: string;
  productId: string | null;
  amountUsd: number;
  status: RecommendationStatus;
  proposedBy: string;
  proposedByName: string;
  decidedBy: string | null;
  decidedByName: string | null;
  decisionNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductCategory =
  | "funds"
  | "fixed_income"
  | "equities"
  | "structured"
  | "alternatives"
  | "private_markets"
  | "lending"
  | "insurance"
  | "cash";

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  funds: "Funds",
  fixed_income: "Fixed income",
  equities: "Equities",
  structured: "Structured products",
  alternatives: "Alternatives",
  private_markets: "Private markets",
  lending: "Lending",
  insurance: "Insurance",
  cash: "Cash & deposits",
};

export type DemoProduct = {
  id: string;
  name: string;
  provider: string;
  category: ProductCategory;
  summary: string;
  /** Trailing 12-month return, percent. */
  returnPct: number;
  /** Annualised since inception, percent. */
  annualisedPct: number;
  riskBand: "conservative" | "moderate" | "growth" | "aggressive";
  feePct: number;
  minimumUsd: number;
  liquidity: "daily" | "weekly" | "monthly" | "quarterly" | "locked";
  currency: "USD" | "GHS" | "GBP";
  available: boolean;
  /** Restrictions surfaced on the product detail and suitability gate. */
  restrictions: string[];
  documents: Array<{ title: string; kind: string }>;
};

export type ServiceRequestStatus = "open" | "in_progress" | "resolved";

export type DemoServiceRequest = {
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  detail: string;
  status: ServiceRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type ComplianceCheckStatus = "passed" | "attention" | "failed";

export type DemoComplianceRecord = {
  id: string;
  clientId: string;
  label: string;
  status: ComplianceCheckStatus;
  detail: string;
  reviewedAt: string;
  reviewedBy: string;
};

export type DemoReportRecord = {
  id: string;
  clientId: string;
  clientName: string;
  reference: string;
  title: string;
  templateKey: string;
  periodLabel: string;
  fileName: string;
  sizeBytes: number;
  generatedBy: string;
  generatedByName: string;
  createdAt: string;
  /** Sent to the client from the workspace Service tab. */
  sentAt: string | null;
};

export type AiSessionEntry = {
  id: string;
  userId: string;
  userName: string;
  role: string;
  mode: string;
  clientId: string | null;
  prompt: string;
  response: string;
  createdAt: string;
  /** Which data scopes were injected into the prompt, for the audit view. */
  contextScopes: string[];
};

export type DemoClientRecord = {
  client: Client;
  detail: ClientDetailState;
  subscription: ClientSubscription;
  segment: ClientSegment;
  /** Team-only note log. Never sent to the client portal. */
  internalNotes: ClientInternalNote[];
  /** Share of the portfolio sitting in cash, percent. */
  idleCashPct: number;
  /** Target cash weighting from the mandate, percent. */
  targetCashPct: number;
  /** Value of assets the client holds outside the bank, USD. */
  heldAwayUsd: number;
  /** Drift from the model portfolio, percentage points. */
  portfolioDriftPct: number;
  /** Revenue booked this quarter, USD. */
  revenueQtdUsd: number;
  /** Net new money this quarter, USD. */
  netFlowQtdUsd: number;
  /** Trailing twelve month portfolio return, percent. */
  performanceYtdPct: number;
  /** Days since the last meaningful interaction. */
  lastEngagementDays: number;
  maturingInvestment: { name: string; valueUsd: number; maturesAt: string } | null;
};

export type DemoDatabase = {
  version: number;
  seededAt: string;
  advisors: Advisor[];
  clients: DemoClientRecord[];
  threads: ConversationThread[];
  documents: ClientDocument[];
  tasks: Task[];
  appointments: Appointment[];
  /** Event-driven alerts. Rule-derived alerts are computed on read. */
  alerts: DemoAlert[];
  /** Alert ids the user has read, including derived ones. */
  readAlertIds: string[];
  recommendations: DemoRecommendation[];
  serviceRequests: DemoServiceRequest[];
  compliance: DemoComplianceRecord[];
  reports: DemoReportRecord[];
  aiSessions: AiSessionEntry[];
  activity: ClientActivity[];
  auditLogs: AuditLogEntry[];
  settings: Record<string, AdvisorSettings>;
  availability: Record<string, ClientAvailability>;
  entitlements: Record<string, AdvisoryEntitlement>;
};

export type { AdvisoryEntitlement, ClientDetailState };
