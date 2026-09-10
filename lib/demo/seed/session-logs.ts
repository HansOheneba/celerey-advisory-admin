import type {
  AppointmentType,
  SessionLog,
} from "@/lib/appointments/types";

type SessionLogInput = {
  title: string;
  type: AppointmentType;
  clientName: string;
  advisorName: string;
};

const TYPE_TAGS: Record<AppointmentType, string[]> = {
  review: ["portfolio", "allocation"],
  annual_review: ["annual", "goals", "planning"],
  quarterly_check_in: ["quarterly", "performance"],
  onboarding: ["onboarding", "kyc"],
  goal_check_in: ["goals", "funding"],
  portfolio_update: ["portfolio", "deployment"],
};

export function demoSessionLog(input: SessionLogInput): SessionLog {
  const tags = TYPE_TAGS[input.type];

  switch (input.type) {
    case "annual_review":
      return {
        title: `${input.title} — advisor record`,
        tags,
        advisorAssessment:
          "Full plan review completed. Client remains aligned to long-term objectives with minor tactical adjustments agreed.",
        discussionPoints: [
          "Walked through 12-month performance and fee drag",
          "Updated life events affecting risk tolerance",
          "Confirmed beneficiary and contact details are current",
          "Reviewed insurance and estate planning referrals",
        ],
        recommendations: [
          { title: "Refresh IPS after income change" },
          { title: "Schedule tax planning call before year end" },
        ],
        sessionNotes: `${input.clientName} engaged throughout. Send written summary within 48 hours.`,
      };
    case "onboarding":
      return {
        title: `${input.title} — advisor record`,
        tags,
        advisorAssessment:
          "Onboarding nearly complete. Client understands fee structure and reporting cadence.",
        discussionPoints: [
          "Confirmed investment mandate and liquidity needs",
          "Explained advisory session entitlement for the plan year",
          "Reviewed document upload checklist",
          "Set expectations for first quarterly check-in",
        ],
        recommendations: [
          { title: "Chase outstanding proof-of-address" },
          { title: "Book first portfolio update after funding settles" },
        ],
        sessionNotes: `Welcome call with ${input.clientName}. ${input.advisorName} to follow up on remaining KYC items.`,
      };
    case "goal_check_in":
      return {
        title: `${input.title} — advisor record`,
        tags,
        advisorAssessment:
          "Goal funding trajectory is acceptable but education and property goals need tighter contribution discipline.",
        discussionPoints: [
          "Compared funded amounts versus target dates",
          "Discussed inflation assumptions on tuition goal",
          "Client asked about pausing one goal to fund another",
        ],
        recommendations: [
          { title: "Model goal trade-off scenarios" },
          { title: "Increase automatic monthly transfer by 8%" },
        ],
        sessionNotes: "Client prefers visual goal dashboards in the next pack.",
      };
    case "portfolio_update":
      return {
        title: `${input.title} — advisor record`,
        tags,
        advisorAssessment:
          "Deployment plan agreed. Client comfortable with staged execution given recent volatility.",
        discussionPoints: [
          "Reviewed proposed sleeve weights after deployment",
          "Discussed T-bill ladder versus IG credit for cash segment",
          "Confirmed settlement account for tranche one",
        ],
        recommendations: [
          { title: "Execute tranche one within five business days" },
          { title: "Send post-trade allocation snapshot" },
        ],
        sessionNotes: `${input.advisorName} to coordinate with portfolio desk on timing.`,
      };
    case "quarterly_check_in":
      return {
        title: `${input.title} — advisor record`,
        tags,
        advisorAssessment:
          "Relationship is healthy. Performance in line with benchmark; cash weighting remains the main talking point.",
        discussionPoints: [
          "Reviewed quarter attribution and benchmark comparison",
          "Discussed idle cash above mandate target",
          "Confirmed no near-term liquidity events",
        ],
        recommendations: [
          { title: "Deploy excess cash in two tranches" },
          { title: "Revisit goal contributions at next review" },
        ],
        sessionNotes: "Client receptive. Follow up with modelled deployment options.",
      };
    default:
      return {
        title: `${input.title} — advisor record`,
        tags,
        advisorAssessment:
          "Constructive session. Open items documented for follow-through within the week.",
        discussionPoints: [
          "Reviewed current allocation versus model",
          "Discussed market outlook and client concerns",
          "Agreed actions and owners for next steps",
        ],
        recommendations: [
          { title: "Issue updated recommendation memo" },
          { title: "Confirm next meeting date" },
        ],
        sessionNotes: `Session with ${input.clientName} logged by ${input.advisorName}.`,
      };
  }
}
