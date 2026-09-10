export type AppointmentType =
  | "review"
  | "annual_review"
  | "quarterly_check_in"
  | "onboarding"
  | "goal_check_in"
  | "portfolio_update";

export type AppointmentStatus =
  | "requested"
  | "proposed"
  | "counter_proposed"
  | "accepted"
  | "declined"
  | "upcoming"
  | "scheduled"
  | "in_progress"
  | "processing_notes"
  | "pending_review"
  | "published"
  | "completed"
  | "cancelled";

export type MeetingProvider = "google_meet" | "teams" | "zoom";

export type NotesVisibility = "none" | "draft" | "published";

export type TranscriptStatus =
  | "pending"
  | "processing"
  | "ready"
  | "failed";

export type MeetingActionItem = {
  title: string;
  owner: string;
  dueAt: string | null;
};

export type MeetingAiNotes = {
  summary: string;
  discussionPoints: string[];
  actionItems: MeetingActionItem[];
  participants: string[];
  transcriptExcerpt: string;
  fullTranscript: string;
};

export type SessionActionCategory = "financial" | "documents" | "goals" | "other";

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
  proposedBy?: "advisor" | "client";
  proposedSlots?: AppointmentSlot[];
  meetingProvider?: MeetingProvider | null;
  meetingUrl?: string | null;
  calendarSynced?: boolean;
  transcriptStatus?: TranscriptStatus;
  notesVisibility?: NotesVisibility;
  aiNotesDraft?: MeetingAiNotes | null;
  aiNotesPublished?: MeetingAiNotes | null;
  publishedAt?: string | null;
  publishedByAdvisorId?: string | null;
  reviewedAt?: string | null;
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

export const MEETING_PROVIDER_LABELS: Record<MeetingProvider, string> = {
  google_meet: "Google Meet",
  teams: "Microsoft Teams",
  zoom: "Zoom",
};

export const NEGOTIATION_STATUSES: AppointmentStatus[] = [
  "requested",
  "proposed",
  "counter_proposed",
];

export const SCHEDULED_STATUSES: AppointmentStatus[] = [
  "upcoming",
  "scheduled",
  "accepted",
  "in_progress",
];
