import {
  daysFromNow,
  daysFromNowAtTime,
} from "@/lib/demo/seed/client-builder";
import { seedClients } from "@/lib/demo/seed/clients";
import { timezoneForResidentCountry } from "@/lib/demo/seed/residency-locations";
import { DEMO_USERS, type DemoUser } from "@/lib/demo/seed/users";
import type {
  DemoAlert,
  DemoClientRecord,
  DemoComplianceRecord,
  DemoDatabase,
  DemoRecommendation,
  DemoServiceRequest,
} from "@/lib/demo/types";
import type { AuditLogEntry } from "@/lib/settings/audit";
import type { Appointment, AdvisoryEntitlement } from "@/lib/appointments/types";
import { demoMeetingNotes } from "@/lib/demo/seed/meeting-notes";
import { demoSessionLog } from "@/lib/demo/seed/session-logs";
import type { ClientAvailability } from "@/lib/availability/types";
import { DEFAULT_CLIENT_AVAILABILITY } from "@/lib/availability/types";
import type { ClientDocument } from "@/lib/documents/types";
import type { ConversationThread } from "@/lib/messages/types";
import type { AdvisorSettings } from "@/lib/settings/local-store";
import { defaultAdvisorSettings } from "@/lib/settings/local-store";
import type { Task } from "@/lib/tasks/types";
import type { Advisor } from "@/types/advisor";
import type { ClientActivity } from "@/types/client";
import type { AppRole, IdentityRole } from "@/lib/auth/roles";

/** Bump when seed shape changes (e.g. AUA/AUM split on client records). */
export const DEMO_DB_VERSION = 10;

const APP_ROLE_BY_DEMO_ROLE: Record<DemoUser["demoRole"], AppRole> = {
  relationship_manager: "advisor",
  portfolio_officer: "advisor",
  team_lead: "admin",
  compliance: "admin",
  management: "super_admin",
};

const IDENTITY_ROLES_BY_DEMO_ROLE: Record<DemoUser["demoRole"], IdentityRole[]> =
  {
    relationship_manager: ["advisor"],
    portfolio_officer: ["advisor"],
    team_lead: ["advisor", "admin"],
    compliance: ["admin"],
    management: ["advisor", "admin", "super_admin"],
  };

function buildAdvisors(clients: DemoClientRecord[]): Advisor[] {
  return DEMO_USERS.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: APP_ROLE_BY_DEMO_ROLE[user.demoRole],
    roles: IDENTITY_ROLES_BY_DEMO_ROLE[user.demoRole],
    clientCount: clients.filter(
      (record) => record.client.advisorId === user.id,
    ).length,
    createdAt: daysFromNow(-user.joinedDaysAgo),
  }));
}

function threadFor(
  record: DemoClientRecord,
  messages: Array<{ author: "advisor" | "client" | "note"; body: string; daysAgo: number }>,
  unreadCount: number,
): ConversationThread {
  const { client } = record;
  const built = messages.map((message, index) => ({
    id: `msg-${client.id}-${index}`,
    author: message.author,
    body: message.body,
    createdAt: daysFromNow(-message.daysAgo),
  }));

  return {
    id: `thread-${client.id}`,
    clientId: client.id,
    clientName: `${client.firstName} ${client.lastName}`,
    clientEmail: client.email,
    advisorId: client.advisorId,
    updatedAt: built[built.length - 1]?.createdAt ?? daysFromNow(-1),
    unreadCount,
    lastMessage: built[built.length - 1] ?? null,
    messages: built,
  };
}

function buildThreads(clients: DemoClientRecord[]): ConversationThread[] {
  const byId = new Map(clients.map((record) => [record.client.id, record]));
  const threads: ConversationThread[] = [];

  const oseiBonsu = byId.get("osei-bonsu");
  if (oseiBonsu) {
    threads.push(
      threadFor(
        oseiBonsu,
        [
          { author: "advisor", body: "Akosua, Q3 pack is in your documents. I flagged the cash and the 2027 school fees goal.", daysAgo: 9 },
          { author: "client", body: "Just opened it. Cash surprised me. Can we talk about putting some to work?", daysAgo: 8 },
          { author: "advisor", body: "Yep. I'll model all at once vs over 3 months before we meet.", daysAgo: 8 },
          { author: "note", body: "Open to deployment. Have both options ready.", daysAgo: 8 },
          { author: "client", body: "Also can the London flat back a facility instead of us selling anything?", daysAgo: 2 },
        ],
        1,
      ),
    );
  }

  const darko = byId.get("darko");
  if (darko) {
    threads.push(
      threadFor(
        darko,
        [
          { author: "advisor", body: "Yaw, the equity run pushed you past the risk band we set. I'd rebalance if you're ok with it.", daysAgo: 5 },
          { author: "client", body: "Returns have been good though. What would you actually sell?", daysAgo: 4 },
          { author: "advisor", body: "Mostly trim tech back to target, rest into IG credit. I'll send the list.", daysAgo: 4 },
        ],
        0,
      ),
    );
  }

  const quaye = byId.get("quaye");
  if (quaye) {
    threads.push(
      threadFor(
        quaye,
        [
          { author: "client", body: "Proceeds landed. Tell me when to move.", daysAgo: 3 },
          { author: "advisor", body: "Nice. I'll split into growth and keep treasury plus for the reserve.", daysAgo: 2 },
          { author: "client", body: "Leave 6 months of clinic costs in cash please.", daysAgo: 2 },
        ],
        1,
      ),
    );
  }

  const mensah = byId.get("mensah-kofi");
  if (mensah) {
    threads.push(
      threadFor(
        mensah,
        [
          { author: "advisor", body: "Kofi, sovereign note rolls next week. Roll it or shift to credit?", daysAgo: 6 },
          { author: "client", body: "What's the income gap either way? I don't want more risk right now.", daysAgo: 5 },
        ],
        1,
      ),
    );
  }

  const nkrumah = byId.get("nkrumah");
  if (nkrumah) {
    threads.push(
      threadFor(
        nkrumah,
        [
          { author: "client", body: "That structured note isn't what we agreed. I'm not ok with it.", daysAgo: 7 },
          { author: "advisor", body: "Understood. I pulled it and compliance is looking at it.", daysAgo: 7 },
          { author: "note", body: "Compliance ticket open. Still need rebalance, book is hot.", daysAgo: 6 },
        ],
        0,
      ),
    );
  }

  const owusu = byId.get("owusu-ansah");
  if (owusu) {
    threads.push(
      threadFor(
        owusu,
        [
          { author: "advisor", body: "Kwabena, for the dev draw you might use Lombard instead of selling holdings.", daysAgo: 11 },
          { author: "client", body: "Maybe. Send terms and how margin works.", daysAgo: 10 },
        ],
        0,
      ),
    );
  }

  const tetteh = byId.get("tetteh");
  if (tetteh) {
    threads.push(
      threadFor(
        tetteh,
        [
          { author: "advisor", body: "Naa, send the two ISA statements and NHS pension when you can. Then we can finish the picture.", daysAgo: 19 },
        ],
        0,
      ),
    );
  }

  const agyapong = byId.get("agyapong");
  if (agyapong) {
    threads.push(
      threadFor(
        agyapong,
        [
          { author: "advisor", body: "Selina, welcome. Still need proof of address and the source of funds letter.", daysAgo: 3 },
          { author: "client", body: "Uploading both by Friday.", daysAgo: 3 },
        ],
        0,
      ),
    );
  }

  const adaMensah = byId.get("ada-mensah");
  if (adaMensah) {
    threads.push(
      threadFor(
        adaMensah,
        [
          {
            author: "advisor",
            body: "Review notes are in documents when you get a minute.",
            daysAgo: 175,
          },
          {
            author: "client",
            body: "Read them. Payslip uploaded.",
            daysAgo: 3,
          },
          {
            author: "advisor",
            body: "Got the payslip. Wed 10am still good?",
            daysAgo: 2,
          },
        ],
        0,
      ),
    );
  }

  const covered = new Set(threads.map((thread) => thread.clientId));
  for (const record of clients) {
    const { client } = record;
    if (covered.has(client.id)) {
      continue;
    }
    if (record.subscription !== "celerey_core" || client.status === "inactive") {
      continue;
    }

    threads.push(
      threadFor(
        record,
        [
          {
            author: "advisor",
            body: `Hey ${client.firstName}, I put a snapshot in documents before we catch up.`,
            daysAgo: 14,
          },
          {
            author: "client",
            body: "Saw it, thanks. Happy to go through at the review.",
            daysAgo: 13,
          },
        ],
        0,
      ),
    );
  }

  return threads;
}

function buildDocuments(clients: DemoClientRecord[]): ClientDocument[] {
  const documents: ClientDocument[] = [];
  const targets = [
    "ada-mensah",
    "osei-bonsu",
    "darko",
    "quaye",
    "mensah-kofi",
    "owusu-ansah",
    "agyapong",
  ];

  const templates: Array<{
    title: string;
    category: ClientDocument["category"];
    fileName: string;
    sizeBytes: number;
    uploadedBy: "advisor" | "client";
    daysAgo: number;
  }> = [
    { title: "Q3 portfolio review", category: "review", fileName: "q3-portfolio-review.pdf", sizeBytes: 842_000, uploadedBy: "advisor", daysAgo: 9 },
    { title: "Investment policy statement", category: "plan", fileName: "investment-policy-statement.pdf", sizeBytes: 318_000, uploadedBy: "advisor", daysAgo: 120 },
    { title: "Passport copy", category: "identity", fileName: "passport.pdf", sizeBytes: 1_240_000, uploadedBy: "client", daysAgo: 300 },
    { title: "Custody statement", category: "statement", fileName: "custody-statement.pdf", sizeBytes: 566_000, uploadedBy: "advisor", daysAgo: 32 },
  ];

  for (const clientId of targets) {
    const record = clients.find((item) => item.client.id === clientId);
    if (!record) continue;

    templates.forEach((template, index) => {
      documents.push({
        id: `doc-${clientId}-${index}`,
        clientId,
        sessionId: null,
        title: template.title,
        category: template.category,
        fileName: template.fileName,
        contentType: "application/pdf",
        sizeBytes: template.sizeBytes,
        uploadedBy: template.uploadedBy,
        uploadedByName:
          template.uploadedBy === "advisor"
            ? record.client.advisorName
            : `${record.client.firstName} ${record.client.lastName}`,
        createdAt: daysFromNow(-template.daysAgo),
        downloadUrl: `/api/demo/documents/doc-${clientId}-${index}/download`,
        downloadUrlExpiresAt: daysFromNow(1),
      });
    });
  }

  return documents;
}

function buildTasks(clients: DemoClientRecord[]): Task[] {
  const specs: Array<{
    clientId: string;
    title: string;
    description: string;
    dueInDays: number;
    priority: Task["priority"];
    assignee: Task["assignee"];
    category: Task["category"];
    status: Task["status"];
  }> = [
    { clientId: "ada-mensah", title: "Increase pension contribution to 10%", description: "Action from annual review — target Q4.", dueInDays: 90, priority: "high", assignee: "client", category: "financial", status: "open" },
    { clientId: "ada-mensah", title: "Upload latest payslip", description: "For income verification.", dueInDays: -3, priority: "medium", assignee: "client", category: "documents", status: "done" },
    { clientId: "osei-bonsu", title: "Model staged cash deployment", description: "Two options: full deployment and staged over three months.", dueInDays: 2, priority: "high", assignee: "advisor", category: "financial", status: "open" },
    { clientId: "osei-bonsu", title: "Prepare education goal top-up plan", description: "2027 tuition goal is 71% funded. Model a monthly uplift.", dueInDays: 5, priority: "high", assignee: "advisor", category: "financial", status: "open" },
    { clientId: "osei-bonsu", title: "Confirm annual review date", description: "Client prefers the last week of the month.", dueInDays: 8, priority: "medium", assignee: "advisor", category: "other", status: "open" },
    { clientId: "darko", title: "Issue rebalance recommendation", description: "Trim technology sleeve to target, move to IG credit.", dueInDays: 1, priority: "high", assignee: "advisor", category: "financial", status: "open" },
    { clientId: "quaye", title: "Execute deployment plan", description: "Fund growth sleeves, retain six months operating costs.", dueInDays: 3, priority: "high", assignee: "advisor", category: "financial", status: "open" },
    { clientId: "mensah-kofi", title: "Present reinvestment options", description: "Compare rolling the note against IG credit income.", dueInDays: 4, priority: "high", assignee: "advisor", category: "financial", status: "open" },
    { clientId: "asare", title: "Third attempt to book annual review", description: "Review is 18 days overdue.", dueInDays: 1, priority: "high", assignee: "advisor", category: "other", status: "open" },
    { clientId: "adjei", title: "Draft portfolio commentary", description: "Client requested written commentary on the growth sleeve.", dueInDays: 6, priority: "medium", assignee: "advisor", category: "documents", status: "open" },
    { clientId: "nkrumah", title: "Close out structured note escalation", description: "Compliance review pending sign-off.", dueInDays: 2, priority: "high", assignee: "advisor", category: "other", status: "open" },
    { clientId: "owusu-ansah", title: "Send Lombard facility terms", description: "Include margin mechanics and collateral schedule.", dueInDays: 3, priority: "medium", assignee: "advisor", category: "documents", status: "open" },
    { clientId: "tetteh", title: "Request held-away statements", description: "NHS pension and two ISAs.", dueInDays: 9, priority: "low", assignee: "client", category: "documents", status: "open" },
    { clientId: "agyapong", title: "Chase outstanding KYC documents", description: "Proof of address and source of funds letter.", dueInDays: 2, priority: "high", assignee: "client", category: "documents", status: "open" },
    { clientId: "boadu", title: "Attrition risk outreach", description: "Fourth outreach attempt after 168 days of silence.", dueInDays: 1, priority: "high", assignee: "advisor", category: "other", status: "open" },
    { clientId: "sarpong", title: "Prepare rebalance pack", description: "Equity sleeve is nine points above model.", dueInDays: 7, priority: "medium", assignee: "advisor", category: "financial", status: "open" },
    { clientId: "osei-bonsu", title: "Circulate Q3 review pack", description: "Sent and opened by the client.", dueInDays: -9, priority: "medium", assignee: "advisor", category: "documents", status: "done" },
    { clientId: "quaye", title: "Confirm cleared sale proceeds", description: "Proceeds confirmed in the premier cash account.", dueInDays: -3, priority: "high", assignee: "advisor", category: "financial", status: "done" },
  ];

  return specs.flatMap((spec, index) => {
    const record = clients.find((item) => item.client.id === spec.clientId);
    if (!record) return [];

    return [
      {
        id: `task-${index}`,
        title: spec.title,
        description: spec.description,
        clientId: spec.clientId,
        clientName: `${record.client.firstName} ${record.client.lastName}`,
        sessionId: null,
        assignee: spec.assignee,
        category: spec.category,
        dueAt: daysFromNow(spec.dueInDays),
        priority: spec.priority,
        status: spec.status,
      } satisfies Task,
    ];
  });
}

function buildAppointments(clients: DemoClientRecord[]): Appointment[] {
  const specs: Array<{
    clientId: string;
    type: Appointment["type"];
    title: string;
    inDays: number;
    atHour?: number;
    atMinute?: number;
    status: Appointment["status"];
    createdBy: Appointment["createdBy"];
    withLog?: boolean;
    publishedNotes?: boolean;
    proposed?: boolean;
  }> = [
    { clientId: "ada-mensah", type: "quarterly_check_in", title: "Quarterly check-in", inDays: 2, atHour: 10, status: "upcoming", createdBy: "advisor" },
    { clientId: "ada-mensah", type: "annual_review", title: "Annual review, March 2026", inDays: -175, status: "published", createdBy: "advisor", withLog: true, publishedNotes: true },
    { clientId: "osei-bonsu", type: "annual_review", title: "Annual review", inDays: 21, atHour: 10, status: "upcoming", createdBy: "advisor" },
    { clientId: "quaye", type: "portfolio_update", title: "Deployment planning call", inDays: 2, atHour: 10, status: "upcoming", createdBy: "advisor" },
    { clientId: "darko", type: "review", title: "Rebalance discussion", inDays: 4, atHour: 14, status: "upcoming", createdBy: "advisor" },
    { clientId: "mensah-kofi", type: "portfolio_update", title: "Maturity reinvestment call", inDays: 3, atHour: 11, status: "upcoming", createdBy: "advisor" },
    { clientId: "owusu-ansah", type: "review", title: "Liquidity options review", inDays: 6, atHour: 15, status: "requested", createdBy: "client" },
    { clientId: "tetteh", type: "goal_check_in", title: "Held-away consolidation", inDays: 9, atHour: 11, status: "requested", createdBy: "client" },
    { clientId: "agyapong", type: "onboarding", title: "Onboarding completion call", inDays: 5, atHour: 9, atMinute: 30, status: "upcoming", createdBy: "advisor" },
    { clientId: "alhassan-tamale", type: "portfolio_update", title: "T-bill ladder review", inDays: 7, atHour: 10, atMinute: 30, status: "proposed", createdBy: "client" },
    { clientId: "darko", type: "review", title: "Cash deployment review", inDays: -3, status: "pending_review", createdBy: "advisor" },
    { clientId: "osei-bonsu", type: "quarterly_check_in", title: "Q3 review", inDays: -9, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "osei-bonsu", type: "goal_check_in", title: "Education goal check-in", inDays: -45, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "osei-bonsu", type: "annual_review", title: "2025 annual review", inDays: -120, status: "published", createdBy: "advisor", withLog: true, publishedNotes: true },
    { clientId: "sarpong", type: "quarterly_check_in", title: "Q3 check-in", inDays: -22, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "sarpong", type: "review", title: "Equity sleeve rebalance", inDays: -58, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "quaye", type: "portfolio_update", title: "Sale proceeds deployment", inDays: -14, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "quaye", type: "quarterly_check_in", title: "Q2 check-in", inDays: -88, status: "published", createdBy: "advisor", withLog: true, publishedNotes: true },
    { clientId: "mensah-kofi", type: "portfolio_update", title: "Note maturity reinvestment", inDays: -18, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "darko", type: "review", title: "Technology overweight review", inDays: -35, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "asare", type: "annual_review", title: "Overdue annual review", inDays: -28, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "adjei", type: "review", title: "Growth sleeve commentary", inDays: -42, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "nkrumah", type: "review", title: "Structured note escalation", inDays: -11, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "owusu-ansah", type: "review", title: "Lombard facility walkthrough", inDays: -31, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "tetteh", type: "goal_check_in", title: "Retirement projection review", inDays: -67, status: "completed", createdBy: "client", withLog: true },
    { clientId: "agyapong", type: "onboarding", title: "Welcome & mandate call", inDays: -12, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "boadu", type: "review", title: "Re-engagement call", inDays: -75, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "alhassan-tamale", type: "portfolio_update", title: "Northern region cash ladder", inDays: -26, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "mensah-sunyani", type: "quarterly_check_in", title: "Q3 portfolio review", inDays: -19, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "aidoo-takoradi", type: "portfolio_update", title: "Export proceeds allocation", inDays: -33, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "ampofo-accra", type: "goal_check_in", title: "Property purchase timeline", inDays: -48, status: "published", createdBy: "advisor", withLog: true, publishedNotes: true },
    { clientId: "adutwum-kumasi", type: "annual_review", title: "Mid-year plan review", inDays: -55, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "nortey-tema", type: "review", title: "Logistics sector exposure", inDays: -40, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "awuah-wa", type: "quarterly_check_in", title: "Q3 check-in", inDays: -24, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "annan", type: "review", title: "Held-away consolidation", inDays: -16, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "yeboah", type: "annual_review", title: "Cross-border tax planning", inDays: -72, status: "published", createdBy: "advisor", withLog: true, publishedNotes: true },
    { clientId: "amoah", type: "quarterly_check_in", title: "Q3 check-in", inDays: -29, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "frimpong", type: "portfolio_update", title: "Conservative sleeve refresh", inDays: -37, status: "completed", createdBy: "advisor", withLog: true },
    { clientId: "appiah-r", type: "review", title: "Cash drag review", inDays: -21, status: "completed", createdBy: "advisor", withLog: true },
  ];

  return specs.flatMap((spec, index) => {
    const record = clients.find((item) => item.client.id === spec.clientId);
    if (!record) return [];

    const { client } = record;

    const scheduleAt = (days: number) =>
      daysFromNowAtTime(days, spec.atHour ?? 10, spec.atMinute ?? 0);

    const scheduledAt =
      spec.status === "requested" || spec.status === "proposed"
        ? spec.inDays >= 0
          ? scheduleAt(spec.inDays)
          : null
        : scheduleAt(spec.inDays);

    const clientName = `${client.firstName} ${client.lastName}`;
    const meetingNotesInput = {
      clientName,
      advisorName: client.advisorName,
      title: spec.title,
    };

    const aiDraft =
      spec.status === "pending_review"
        ? demoMeetingNotes(meetingNotesInput)
        : null;

    const aiPublished =
      spec.publishedNotes || spec.status === "published"
        ? demoMeetingNotes(meetingNotesInput)
        : null;

    const sessionLog = spec.withLog
      ? demoSessionLog({
          title: spec.title,
          type: spec.type,
          clientName,
          advisorName: client.advisorName,
        })
      : null;

    return [
      {
        id: `appt-${index}`,
        clientId: client.id,
        clientName,
        advisorId: client.advisorId,
        advisorName: client.advisorName,
        planYear: String(new Date().getFullYear()),
        type: spec.type,
        title: spec.title,
        scheduledAt,
        durationMinutes: 45,
        status: spec.status,
        createdBy: spec.createdBy,
        proposedBy: spec.status === "proposed" ? spec.createdBy : undefined,
        meetingProvider:
          spec.status === "proposed" ||
          spec.status === "pending_review" ||
          spec.status === "published"
            ? "google_meet"
            : null,
        meetingUrl:
          spec.status === "pending_review" || spec.status === "published"
            ? "https://meet.google.com/demo-celerey-session"
            : null,
        calendarSynced:
          spec.status === "pending_review" || spec.status === "published",
        transcriptStatus:
          spec.status === "pending_review" || spec.status === "published"
            ? "ready"
            : "pending",
        notesVisibility: spec.publishedNotes
          ? "published"
          : spec.status === "pending_review"
            ? "draft"
            : "none",
        aiNotesDraft: aiDraft,
        aiNotesPublished: aiPublished,
        publishedAt: aiPublished ? daysFromNow(spec.inDays + 1) : null,
        reviewedAt: aiPublished ? daysFromNow(spec.inDays + 1) : null,
        log: sessionLog,
        progress: null,
        actionIds: [],
        documentIds: [],
      } satisfies Appointment,
    ];
  });
}

function buildRecommendations(
  clients: DemoClientRecord[],
): DemoRecommendation[] {
  const specs: Array<{
    clientId: string;
    title: string;
    rationale: string;
    productId: string | null;
    amountUsd: number;
    status: DemoRecommendation["status"];
    proposedBy: string;
    decidedBy?: string;
    decisionNote?: string;
    daysAgo: number;
  }> = [
    {
      clientId: "osei-bonsu",
      title: "Deploy $3.3m excess cash in three tranches",
      rationale:
        "Cash is 12% of the portfolio against a 4% mandate target, costing roughly 40 basis points of drag annually.",
      productId: "prd-treasury-plus",
      amountUsd: 3_300_000,
      status: "pending_compliance",
      proposedBy: "rm-akua",
      daysAgo: 2,
    },
    {
      clientId: "darko",
      title: "Rebalance technology sleeve to model weight",
      rationale:
        "Portfolio has drifted 11.6 points outside the agreed moderate risk band after the equity run.",
      productId: "prd-ig-credit",
      amountUsd: 1_800_000,
      status: "proposed",
      proposedBy: "rm-akua",
      daysAgo: 4,
    },
    {
      clientId: "quaye",
      title: "Fund growth sleeves with sale proceeds",
      rationale:
        "Proceeds of $2.95m have cleared. Deploy across growth sleeves, retaining six months of operating costs in treasury plus.",
      productId: "prd-global-equity-core",
      amountUsd: 2_350_000,
      status: "approved",
      proposedBy: "rm-akua",
      decidedBy: "tl-nana",
      decisionNote: "Suitable and within mandate. Approved for execution.",
      daysAgo: 2,
    },
    {
      clientId: "mensah-kofi",
      title: "Roll maturing note into investment grade credit",
      rationale:
        "The $1.4m sovereign note matures in five days. IG credit offers additional yield within the conservative band.",
      productId: "prd-ig-credit",
      amountUsd: 1_400_000,
      status: "proposed",
      proposedBy: "rm-daniel",
      daysAgo: 5,
    },
    {
      clientId: "nkrumah",
      title: "Allocate to Autocallable Equity Note",
      rationale:
        "Originally proposed for yield enhancement against a low-return cash position.",
      productId: "prd-autocall-note",
      amountUsd: 1_000_000,
      status: "blocked",
      proposedBy: "rm-daniel",
      decidedBy: "cmp-esi",
      decisionNote:
        "Blocked. Product risk band is aggressive against a conservative mandate and no appropriateness assessment exists.",
      daysAgo: 7,
    },
    {
      clientId: "owusu-ansah",
      title: "Establish $6m Lombard facility",
      rationale:
        "Releases development liquidity without crystallising gains or disturbing the securities portfolio.",
      productId: "prd-lombard",
      amountUsd: 6_000_000,
      status: "pending_compliance",
      proposedBy: "rm-akua",
      daysAgo: 10,
    },
    {
      clientId: "sarpong",
      title: "Trim equity sleeve back to model",
      rationale: "Equity exposure is nine points above the model allocation.",
      productId: "prd-sovereign-ladder",
      amountUsd: 940_000,
      status: "draft",
      proposedBy: "rm-akua",
      daysAgo: 1,
    },
    {
      clientId: "yeboah",
      title: "Add private markets allocation",
      rationale:
        "Long horizon and liquid net worth support a 10% private markets sleeve.",
      productId: "prd-private-equity-vi",
      amountUsd: 1_500_000,
      status: "executed",
      proposedBy: "rm-akua",
      decidedBy: "po-selorm",
      decisionNote: "Executed at the quarterly capital call.",
      daysAgo: 34,
    },
  ];

  const userById = new Map(DEMO_USERS.map((user) => [user.id, user]));

  return specs.flatMap((spec, index) => {
    const record = clients.find((item) => item.client.id === spec.clientId);
    if (!record) return [];

    return [
      {
        id: `rec-${index}`,
        clientId: spec.clientId,
        clientName: `${record.client.firstName} ${record.client.lastName}`,
        title: spec.title,
        rationale: spec.rationale,
        productId: spec.productId,
        amountUsd: spec.amountUsd,
        status: spec.status,
        proposedBy: spec.proposedBy,
        proposedByName: userById.get(spec.proposedBy)?.name ?? "Advisor",
        decidedBy: spec.decidedBy ?? null,
        decidedByName: spec.decidedBy
          ? (userById.get(spec.decidedBy)?.name ?? null)
          : null,
        decisionNote: spec.decisionNote ?? null,
        createdAt: daysFromNow(-spec.daysAgo),
        updatedAt: daysFromNow(-spec.daysAgo + 0.5),
      } satisfies DemoRecommendation,
    ];
  });
}

function buildServiceRequests(
  clients: DemoClientRecord[],
): DemoServiceRequest[] {
  const specs: Array<{
    clientId: string;
    subject: string;
    detail: string;
    status: DemoServiceRequest["status"];
    daysAgo: number;
  }> = [
    { clientId: "nkrumah", subject: "Dispute over structured note recommendation", detail: "Client states the recommendation did not reflect the agreed conservative mandate. Escalated to Compliance.", status: "in_progress", daysAgo: 7 },
    { clientId: "osei-bonsu", subject: "Request for facility against London property", detail: "Client asked whether a facility can be raised instead of selling assets.", status: "open", daysAgo: 2 },
    { clientId: "tetteh", subject: "Transfer of two ISA accounts", detail: "Client requested transfer paperwork for consolidation.", status: "open", daysAgo: 19 },
    { clientId: "mensah-kofi", subject: "Change of correspondence address", detail: "Updated address confirmed and applied.", status: "resolved", daysAgo: 40 },
  ];

  return specs.flatMap((spec, index) => {
    const record = clients.find((item) => item.client.id === spec.clientId);
    if (!record) return [];

    return [
      {
        id: `svc-${index}`,
        clientId: spec.clientId,
        clientName: `${record.client.firstName} ${record.client.lastName}`,
        subject: spec.subject,
        detail: spec.detail,
        status: spec.status,
        createdAt: daysFromNow(-spec.daysAgo),
        updatedAt: daysFromNow(-spec.daysAgo + 1),
      } satisfies DemoServiceRequest,
    ];
  });
}

function buildCompliance(
  clients: DemoClientRecord[],
): DemoComplianceRecord[] {
  const records: DemoComplianceRecord[] = [];

  for (const record of clients) {
    const { client } = record;
    const onboarding = client.status === "onboarding";

    records.push(
      {
        id: `cmp-${client.id}-kyc`,
        clientId: client.id,
        label: "KYC verification",
        status: onboarding ? "attention" : "passed",
        detail: onboarding
          ? "Proof of address and source of funds letter outstanding."
          : "Identity and address verified against certified documents.",
        reviewedAt: daysFromNow(onboarding ? -3 : -180),
        reviewedBy: "Esi Appiah",
      },
      {
        id: `cmp-${client.id}-aml`,
        clientId: client.id,
        label: "AML screening",
        status: "passed",
        detail: "No adverse media or sanctions matches on the latest screen.",
        reviewedAt: daysFromNow(-30),
        reviewedBy: "Esi Appiah",
      },
      {
        id: `cmp-${client.id}-suitability`,
        clientId: client.id,
        label: "Suitability assessment",
        status: record.portfolioDriftPct >= 8 ? "failed" : "passed",
        detail:
          record.portfolioDriftPct >= 8
            ? `Portfolio sits ${record.portfolioDriftPct.toFixed(1)} points outside the agreed ${client.riskLevel} band.`
            : `Allocation is consistent with the agreed ${client.riskLevel} risk band.`,
        reviewedAt: daysFromNow(-14),
        reviewedBy: "Esi Appiah",
      },
    );
  }

  return records;
}

function buildEventAlerts(clients: DemoClientRecord[]): DemoAlert[] {
  const alerts: DemoAlert[] = [];
  const byId = new Map(clients.map((record) => [record.client.id, record]));

  const push = (
    id: string,
    clientId: string,
    kind: DemoAlert["kind"],
    severity: DemoAlert["severity"],
    title: string,
    detail: string,
    daysAgo: number,
    workspaceTab?: string,
  ) => {
    const record = byId.get(clientId);
    if (!record) return;

    alerts.push({
      id,
      kind,
      severity,
      title,
      detail,
      clientId,
      clientName: `${record.client.firstName} ${record.client.lastName}`,
      advisorId: record.client.advisorId,
      workspaceTab,
      createdAt: daysFromNow(-daysAgo),
      read: false,
    });
  };

  push("alert-escalation-nkrumah", "nkrumah", "escalation", "critical", "Escalation open", "Client disputes the structured note recommendation. Compliance review in progress.", 7, "compliance");
  push("alert-message-osei-bonsu", "osei-bonsu", "client_message", "info", "New client message", "Asked about using the London flat for a facility instead of selling.", 2, "advisory");
  push("alert-message-quaye", "quaye", "client_message", "info", "New client message", "Proceeds cleared, ready to fund.", 3, "advisory");
  push("alert-message-mensah", "mensah-kofi", "client_message", "info", "New client message", "Wants income comparison before the note matures.", 5, "advisory");
  push("alert-doc-agyapong", "agyapong", "document_uploaded", "warning", "KYC documents outstanding", "Proof of address and source of funds letter still missing.", 3, "compliance");

  return alerts;
}

function buildActivity(clients: DemoClientRecord[]): ClientActivity[] {
  const specs: Array<{
    clientId: string;
    type: ClientActivity["type"];
    summary: string;
    daysAgo: number;
  }> = [
    { clientId: "osei-bonsu", type: "review", summary: "Q3 review pack sent and opened", daysAgo: 9 },
    { clientId: "darko", type: "alert", summary: "Risk band breach flagged for review", daysAgo: 5 },
    { clientId: "quaye", type: "message", summary: "Proceeds cleared, ready to fund", daysAgo: 3 },
    { clientId: "mensah-kofi", type: "alert", summary: "Sovereign note matures in five days", daysAgo: 1 },
    { clientId: "owusu-ansah", type: "message", summary: "Requested Lombard facility terms", daysAgo: 10 },
    { clientId: "agyapong", type: "document", summary: "Onboarding started — KYC pending", daysAgo: 3 },
    { clientId: "sarpong", type: "goal", summary: "Education goal funding updated", daysAgo: 12 },
    { clientId: "nkrumah", type: "alert", summary: "Structured note recommendation blocked", daysAgo: 7 },
  ];

  return specs.flatMap((spec, index) => {
    const record = clients.find((item) => item.client.id === spec.clientId);
    if (!record) return [];

    return [
      {
        id: `activity-${index}`,
        clientId: spec.clientId,
        clientName: `${record.client.firstName} ${record.client.lastName}`,
        type: spec.type,
        summary: spec.summary,
        occurredAt: daysFromNow(-spec.daysAgo),
      } satisfies ClientActivity,
    ];
  });
}

function buildAuditLogs(): AuditLogEntry[] {
  const specs: Array<{
    actorId: string;
    action: string;
    targetType: string | null;
    targetId: string | null;
    targetLabel: string | null;
    daysAgo: number;
  }> = [
    { actorId: "cmp-esi", action: "recommendation.blocked", targetType: "recommendation", targetId: "rec-4", targetLabel: "Autocallable Equity Note — A. Nkrumah", daysAgo: 7 },
    { actorId: "tl-nana", action: "recommendation.approved", targetType: "recommendation", targetId: "rec-2", targetLabel: "Fund growth sleeves — M. Quaye", daysAgo: 2 },
    { actorId: "rm-akua", action: "recommendation.proposed", targetType: "recommendation", targetId: "rec-0", targetLabel: "Deploy excess cash — A. Osei-Bonsu", daysAgo: 2 },
    { actorId: "rm-akua", action: "report.generated", targetType: "client", targetId: "osei-bonsu", targetLabel: "Q3 portfolio review", daysAgo: 9 },
    { actorId: "po-selorm", action: "trade.executed", targetType: "recommendation", targetId: "rec-7", targetLabel: "Private markets allocation — C. Yeboah", daysAgo: 34 },
    { actorId: "mgt-kwame", action: "roles.updated", targetType: "staff", targetId: "rm-daniel", targetLabel: "Daniel Mensah", daysAgo: 46 },
    { actorId: "rm-daniel", action: "client.created", targetType: "client", targetId: "agyapong", targetLabel: "Selina Agyapong", daysAgo: 24 },
    { actorId: "cmp-esi", action: "compliance.reviewed", targetType: "client", targetId: "darko", targetLabel: "Suitability assessment failed", daysAgo: 14 },
    { actorId: "rm-akua", action: "message.sent", targetType: "client", targetId: "darko", targetLabel: "Rebalance discussion", daysAgo: 4 },
    { actorId: "tl-nana", action: "assignment.changed", targetType: "client", targetId: "kyei", targetLabel: "Reassigned to Daniel Mensah", daysAgo: 60 },
  ];

  const userById = new Map(DEMO_USERS.map((user) => [user.id, user]));

  return specs.map((spec, index) => ({
    id: `audit-${index}`,
    actorId: spec.actorId,
    actorName: userById.get(spec.actorId)?.name ?? "Staff",
    action: spec.action,
    targetType: spec.targetType,
    targetId: spec.targetId,
    targetLabel: spec.targetLabel,
    occurredAt: daysFromNow(-spec.daysAgo),
  }));
}

function buildSettings(): Record<string, AdvisorSettings> {
  const settings: Record<string, AdvisorSettings> = {};

  for (const user of DEMO_USERS) {
    settings[user.id] = {
      ...defaultAdvisorSettings(user.name),
      title: user.title,
      phone: "+233 30 200 1000",
      bio: `${user.title} at Fidelity.`,
    };
  }

  return settings;
}

function buildAvailability(
  clients: DemoClientRecord[],
): Record<string, ClientAvailability> {
  const availability: Record<string, ClientAvailability> = {};

  for (const record of clients) {
    availability[record.client.id] = {
      ...DEFAULT_CLIENT_AVAILABILITY,
      timezone: timezoneForResidentCountry(
        record.detail.user.resident_country ?? "Ghana",
      ),
    };
  }

  return availability;
}

function buildEntitlements(
  clients: DemoClientRecord[],
): Record<string, AdvisoryEntitlement> {
  const entitlements: Record<string, AdvisoryEntitlement> = {};
  const planYear = String(new Date().getFullYear());

  for (const record of clients) {
    const included = record.segment === "uhnw" ? 6 : 4;
    const used = record.client.status === "onboarding" ? 1 : 2;

    entitlements[record.client.id] = {
      planYear,
      included,
      used,
      remaining: included - used,
    };
  }

  return entitlements;
}

export function buildDemoDatabase(): DemoDatabase {
  const clients = seedClients();

  return {
    version: DEMO_DB_VERSION,
    seededAt: new Date().toISOString(),
    advisors: buildAdvisors(clients),
    clients,
    threads: buildThreads(clients),
    documents: buildDocuments(clients),
    tasks: buildTasks(clients),
    appointments: buildAppointments(clients),
    alerts: buildEventAlerts(clients),
    readAlertIds: [],
    recommendations: buildRecommendations(clients),
    serviceRequests: buildServiceRequests(clients),
    compliance: buildCompliance(clients),
    reports: [],
    aiSessions: [],
    activity: buildActivity(clients),
    auditLogs: buildAuditLogs(),
    settings: buildSettings(),
    availability: buildAvailability(clients),
    entitlements: buildEntitlements(clients),
  };
}
