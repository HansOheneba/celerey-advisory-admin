import type { MeetingAiNotes } from "@/lib/appointments/types";

export function demoMeetingNotes(input: {
  clientName: string;
  advisorName: string;
  title: string;
}): MeetingAiNotes {
  return {
    summary: `${input.title} with ${input.clientName}. Portfolio performance, cash deployment, and goal funding were reviewed. The client confirmed appetite to proceed with staged deployment of excess cash.`,
    discussionPoints: [
      "Reviewed year-to-date performance versus benchmark",
      "Discussed cash weighting above mandate target",
      "Confirmed education goal funding trajectory",
      "Agreed next check-in after deployment tranche one",
    ],
    actionItems: [
      {
        title: "Send staged deployment proposal",
        owner: input.advisorName,
        dueAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
      },
      {
        title: "Upload latest property valuation",
        owner: input.clientName,
        dueAt: new Date(Date.now() + 10 * 86_400_000).toISOString(),
      },
    ],
    participants: [input.clientName, input.advisorName],
    transcriptExcerpt:
      "Advisor: We still have meaningful cash above the four percent target. Client: I'd prefer to deploy in two tranches rather than all at once...",
    fullTranscript: `[00:00] ${input.advisorName}: Thanks for joining today. Let's walk through performance and the cash position.\n[02:14] ${input.clientName}: Performance is broadly in line with expectations, but the cash drag is noticeable.\n[08:40] ${input.advisorName}: We can model a two-tranche deployment starting next week.\n[14:02] ${input.clientName}: That works. Please send the proposal before Friday.`,
  };
}
