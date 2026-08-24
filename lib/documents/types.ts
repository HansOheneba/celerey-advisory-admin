export type DocumentCategory =
  | "identity"
  | "statement"
  | "tax"
  | "contract"
  | "report"
  | "plan"
  | "review"
  | "other";

export type ClientDocument = {
  id: string;
  clientId: string;
  sessionId: string | null;
  title: string;
  category: DocumentCategory;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: "advisor" | "client";
  uploadedByName: string;
  createdAt: string;
  downloadUrl: string;
  downloadUrlExpiresAt: string;
};

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  identity: "Identity",
  statement: "Statement",
  tax: "Tax",
  contract: "Contract",
  report: "Report",
  plan: "Plan",
  review: "Review",
  other: "Other",
};

export const DOCUMENT_CATEGORIES = Object.keys(
  DOCUMENT_CATEGORY_LABELS,
) as DocumentCategory[];
