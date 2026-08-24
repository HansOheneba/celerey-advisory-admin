export type AppointmentType =
  | "review"
  | "annual_review"
  | "quarterly_check_in"
  | "onboarding"
  | "goal_check_in"
  | "portfolio_update";

export type AppointmentStatus =
  | "requested"
  | "upcoming"
  | "completed"
  | "cancelled";

export type SessionActionCategory = "financial" | "documents" | "other";

export type SessionRecommendation = {
  title: string;
};

export type SessionLog = {
  title: string;
  tags: string[];
  advisorAssessment: string;
  discussionPoints: string[];
  recommendations: SessionRecommendation[];
  sessionNotes: string;
};

export type ProgressMetric = {
  key: string;
  label: string;
  value: number;
  previous: number;
  unit: "currency" | "percent" | "number";
  currency?: string;
};

export type ProgressSnapshot = {
  capturedAt: string;
  metrics: ProgressMetric[];
};

export type AppointmentSlot = {
  startAt: string;
  endAt: string;
  durationMinutes: number;
};

export type AdvisoryEntitlement = {
  planYear: string;
  included: number;
  used: number;
  remaining: number;
};

export type Appointment = {
  id: string;
  clientId: string;
  clientName: string;
  advisorId: string;
  advisorName: string;
  planYear: string;
  type: AppointmentType;
  title: string;
  scheduledAt: string | null;
  durationMinutes: number;
  status: AppointmentStatus;
  createdBy: "advisor" | "client";
  log: SessionLog | null;
  progress: ProgressSnapshot | null;
  actionIds: string[];
  documentIds: string[];
};

export type SessionLogInput = {
  appointmentId: string;
  title: string;
  tags: string[];
  advisorAssessment: string;
  discussionPoints: string[];
  recommendations: SessionRecommendation[];
  sessionNotes: string;
  actions: Array<{
    title: string;
    dueAt: string | null;
    category: SessionActionCategory;
    priority: "low" | "medium" | "high";
  }>;
  documentIds?: string[];
};

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  review: "Review",
  annual_review: "Annual review",
  quarterly_check_in: "Quarterly check-in",
  onboarding: "Onboarding call",
  goal_check_in: "Goal check-in",
  portfolio_update: "Portfolio update",
};
