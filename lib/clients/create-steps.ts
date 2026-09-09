/** Multi-step wizard for direct client creation (docs/admin-accepted-fields.json). */

export const CREATE_CLIENT_WIZARD_STEPS = [
  {
    id: "identity",
    label: "Identity & profile",
    description:
      "Account credentials, location, and profile fields the client dashboard reads.",
  },
  {
    id: "plan",
    label: "Plan & cash flow",
    description:
      "Goals, income, expenses, emergency fund, and retirement configuration.",
  },
  {
    id: "holdings",
    label: "Assets & properties",
    description:
      "Investment holdings and property records including nested mortgage and property insurance.",
  },
  {
    id: "debt",
    label: "Debt & insurance",
    description:
      "Standalone liabilities and personal insurance policies (not property-tied cover).",
  },
  {
    id: "access",
    label: "Access & create",
    description: "Advisor assignment, subscription access, and final submission.",
  },
] as const;

export type CreateClientWizardStepId =
  (typeof CREATE_CLIENT_WIZARD_STEPS)[number]["id"];

export function wizardStepIndex(stepId: CreateClientWizardStepId): number {
  return CREATE_CLIENT_WIZARD_STEPS.findIndex((step) => step.id === stepId);
}
