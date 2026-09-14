import "server-only";

import { DEMO_USERS, demoUserById, type DemoUser } from "@/lib/demo/seed/users";
import { appendInternalNote } from "@/lib/clients/internal-notes";
import { recordClientContact } from "@/lib/clients/contact-tracking";
import {
  canAccessClientRecord,
  scopedClientRecords,
} from "@/lib/demo/book-scope";
import { clientSummaryFromRecord } from "@/lib/demo/client-segment-sync";
import { daysFromNow } from "@/lib/demo/seed/client-builder";
import { deriveAlerts } from "@/lib/demo/insights";
import {
  mutateClientProfileRecord,
  nextProfileId,
} from "@/lib/demo/profile";
import { mutateDemoDb, readDemoDb } from "@/lib/demo/store";
import type { DemoClientRecord, DemoDatabase } from "@/lib/demo/types";
import { bookScope } from "@/lib/auth/capabilities";
import type { ClientDetailState } from "@/types/client-detail";
import type { Client } from "@/types/client";

const ACCESS_TOKEN_PREFIX = "demo.";

export function demoAccessToken(userId: string): string {
  return `${ACCESS_TOKEN_PREFIX}${userId}`;
}

function userFromToken(accessToken?: string): DemoUser | null {
  if (!accessToken?.startsWith(ACCESS_TOKEN_PREFIX)) {
    return null;
  }

  return demoUserById(accessToken.slice(ACCESS_TOKEN_PREFIX.length)) ?? null;
}

function scopedClients(db: DemoDatabase, user: DemoUser): DemoClientRecord[] {
  return scopedClientRecords(db, {
    userId: user.id,
    demoRole: user.demoRole,
  });
}

type Params = Record<string, string | number | boolean | undefined | null>;

type HandlerContext = {
  db: DemoDatabase;
  user: DemoUser;
  body: Record<string, unknown>;
  params: Params;
  formData: FormData | null;
};

type Handler = (ctx: HandlerContext) => Promise<unknown> | unknown;

function param(ctx: HandlerContext, ...keys: string[]): string {
  for (const key of keys) {
    const value = ctx.params[key];
    if (value !== undefined && value !== null && value !== "") {
      return String(value);
    }
  }
  return "";
}

function bodyString(ctx: HandlerContext, ...keys: string[]): string {
  for (const key of keys) {
    const value = ctx.body[key];
    if (typeof value === "string" && value) {
      return value;
    }
  }
  return "";
}

function numberParam(ctx: HandlerContext, key: string, fallback: number) {
  const raw = ctx.params[key];
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    pageCount,
  };
}

function fullName(client: Client) {
  return `${client.firstName} ${client.lastName}`;
}

/**
 * The client detail mapper expects the API's raw payload shape, so convert our
 * normalised state back into that form rather than bypassing the mapper.
 */
function toRawDetailState(state: ClientDetailState) {
  return {
    user: state.user,
    riskAssessment: state.riskAssessment,
    incomeRows: state.incomeRows.map((row) => ({
      id: row.id,
      name: row.name,
      amount: row.amount,
      is_recurring: row.isRecurring,
      recurring_type: row.recurringType,
      start_date: row.startDate,
      end_date: row.endDate,
    })),
    expenseCategories: state.expenseCategories.map((row) => ({
      id: row.id,
      name: row.name,
      amount: row.amount,
      essential: row.essential,
      is_recurring: row.isRecurring,
      recurring_type: row.recurringType,
      start_date: row.startDate,
    })),
    goals: state.goals.map((goal) => ({
      goal_id: goal.id,
      user_id: goal.userId,
      title: goal.title,
      category: goal.category,
      description: goal.description,
      priority: goal.priority,
      current_amount: goal.current,
      target_amount: goal.target ?? null,
      monthly_contribution_needed: goal.monthlyContribution ?? 0,
      status: goal.status,
      years_remaining: goal.yearsRemaining,
    })),
    goalsMeta: {
      total_monthly_needed: state.goalsMeta.totalMonthlyNeeded,
      total_goals: state.goalsMeta.totalGoals,
      completed_goals: state.goalsMeta.completedGoals,
      active_goals: state.goalsMeta.activeGoals,
    },
    holdings: state.holdings,
    accounts: state.accounts,
    propertyAssets: state.propertyAssets,
    liabilities: state.liabilities,
    insurancePolicies: state.insurancePolicies,
    retirement: {
      config: {
        currentAge: state.retirement.currentAge,
        retirementAge: state.retirement.retirementAge,
        lifeExpectancy: state.retirement.lifeExpectancy,
        currentInvested: state.retirement.currentInvested,
        monthlySavings: state.retirement.monthlySavings,
        existingPensionBalance: state.retirement.existingPensionBalance,
        monthlyPensionContribution: state.retirement.monthlyPensionContribution,
        expectedReturnPct: state.retirement.expectedReturnPct,
        inflationPct: state.retirement.inflationPct,
        safeWithdrawalRatePct: state.retirement.safeWithdrawalRatePct,
        desiredMonthlyIncome: state.retirement.desiredMonthlyIncome,
        storageLocation: state.retirement.storageLocation ?? null,
        storage_location: state.retirement.storageLocation ?? null,
      },
      projections: state.retirementProjections ?? {},
    },
    emergencyFund: {
      cash_balance: state.emergencyFund.currentCashBalance,
      target_months: state.emergencyFund.targetMonths,
      storage_location: state.emergencyFund.storageLocation ?? null,
      computed: {
        runway_months: state.emergencyFund.computed?.monthsCovered ?? 0,
        shortfall: state.emergencyFund.computed?.gap ?? 0,
      },
    },
    cashFlowHistory: state.cashFlowHistory,
    cashFlowSummary: state.cashFlowSummary,
    portfolioPerformance: state.portfolioPerformance,
    allocation: state.allocation,
    taxProfile: state.taxProfile,
    dependents: state.dependents,
    freshness: state.freshness,
    profileCompletionScore: state.profileCompletionScore,
  };
}

function roleContextFor(user: DemoUser) {
  const scope = bookScope(user.demoRole);

  return {
    activeRole: user.demoRole === "relationship_manager" ? "advisor" : "admin",
    availableRoles:
      user.demoRole === "management" ? ["advisor", "admin"] : ["advisor"],
    trueRoles:
      user.demoRole === "management"
        ? ["super_admin", "admin", "advisor"]
        : user.demoRole === "team_lead" || user.demoRole === "compliance"
          ? ["admin", "advisor"]
          : ["advisor"],
    isSuperAdmin: user.demoRole === "management",
    scope: scope === "own_book" ? "own_book" : "firm_wide",
  };
}

function sortClients(
  records: DemoClientRecord[],
  sortBy: string,
  sortDir: string,
) {
  const direction = sortDir === "desc" ? -1 : 1;

  return [...records].sort((a, b) => {
    switch (sortBy) {
      case "aua":
        return (a.client.aua - b.client.aua) * direction;
      case "aum":
        return (a.client.aum - b.client.aum) * direction;
      case "lastContactAt":
        return (
          (Date.parse(a.client.lastContactAt) -
            Date.parse(b.client.lastContactAt)) *
          direction
        );
      case "nextReviewAt":
        return (
          (Date.parse(a.client.nextReviewAt) -
            Date.parse(b.client.nextReviewAt)) *
          direction
        );
      default:
        return fullName(a.client).localeCompare(fullName(b.client)) * direction;
    }
  });
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function recordAudit(
  db: DemoDatabase,
  user: DemoUser,
  action: string,
  target: { type: string; id: string; label: string },
) {
  db.auditLogs.unshift({
    id: nextId("audit"),
    actorId: user.id,
    actorName: user.name,
    action,
    targetType: target.type,
    targetId: target.id,
    targetLabel: target.label,
    occurredAt: new Date().toISOString(),
  });
}

const HANDLERS: Record<string, Handler> = {
  "auth.request-otp": () => ({ message: "Demo code sent." }),

  "auth.verify-otp": (ctx) => {
    const email = bodyString(ctx, "email").toLowerCase();
    const user =
      DEMO_USERS.find((candidate) => candidate.email.toLowerCase() === email) ??
      DEMO_USERS[0];

    return { session_token: demoAccessToken(user.id) };
  },

  "auth.revoke-session": () => ({ revoked: true }),

  "admin.auth.me": (ctx) => ({
    advisor: {
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      role: ctx.user.demoRole === "relationship_manager" ? "advisor" : "admin",
    },
  }),

  "admin.session.active-role": (ctx) => roleContextFor(ctx.user),
  "admin.session.switch-role": (ctx) => roleContextFor(ctx.user),

  "admin.clients.find": (ctx) => {
    const query = param(ctx, "query").toLowerCase();
    const status = param(ctx, "status") || "all";
    const riskLevel = param(ctx, "riskLevel") || "all";
    const subscription = param(ctx, "subscription") || "all";
    const advisorId = param(ctx, "advisor_id", "advisorId");
    const page = numberParam(ctx, "page", 1);
    const pageSize = numberParam(ctx, "pageSize", 20);

    let records = scopedClients(ctx.db, ctx.user);

    if (advisorId) {
      records = records.filter(
        (record) => record.client.advisorId === advisorId,
      );
    }

    if (query) {
      records = records.filter((record) => {
        const { client } = record;
        return (
          fullName(client).toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.location.toLowerCase().includes(query)
        );
      });
    }

    if (status !== "all") {
      records = records.filter((record) => record.client.status === status);
    }

    if (riskLevel !== "all") {
      records = records.filter(
        (record) => record.client.riskLevel === riskLevel,
      );
    }

    if (subscription !== "all") {
      records = records.filter(
        (record) => record.client.subscription === subscription,
      );
    }

    const sorted = sortClients(
      records,
      param(ctx, "sortBy") || "name",
      param(ctx, "sortDir") || "asc",
    );

    const pageResult = paginate(sorted, page, pageSize);

    return {
      ...pageResult,
      items: pageResult.items.map((record) => clientSummaryFromRecord(record)),
    };
  },

  "admin.clients.detail": (ctx) => {
    const clientId = param(ctx, "client_id", "clientId");

    if (
      !canAccessClientRecord(
        ctx.db,
        { userId: ctx.user.id, demoRole: ctx.user.demoRole },
        clientId,
      )
    ) {
      throw new DemoApiError("Client not found.", 404);
    }

    const record = ctx.db.clients.find(
      (candidate) => candidate.client.id === clientId,
    );

    if (!record) {
      throw new DemoApiError("Client not found.", 404);
    }

    return {
      id: record.client.id,
      subscription: record.subscription,
      summary: record.client,
      state: toRawDetailState(record.detail),
    };
  },

  "admin.clients.create": async (ctx) => {
    const firstName = bodyString(ctx, "firstName");
    const lastName = bodyString(ctx, "lastName");
    const email = bodyString(ctx, "email");
    const advisorId = bodyString(ctx, "advisor_id", "advisorId") || ctx.user.id;
    const grantCore = ctx.body.grantCore === true;
    const creationMode = bodyString(ctx, "creationMode") || "invite";
    const identity =
      ctx.body.identity && typeof ctx.body.identity === "object"
        ? (ctx.body.identity as Record<string, unknown>)
        : null;
    const isDirect = creationMode === "direct" && identity !== null;
    const displayName =
      typeof identity?.display_name === "string"
        ? identity.display_name
        : `${firstName} ${lastName}`.trim();
    const phoneNumber =
      typeof identity?.phone_number === "string" ? identity.phone_number : "";
    const residentCountry =
      typeof identity?.resident_country === "string"
        ? identity.resident_country
        : null;
    const residentCity =
      typeof identity?.resident_city === "string" ? identity.resident_city : null;
    const currency =
      typeof identity?.currency === "string" ? identity.currency : "USD";
    const location =
      residentCity && residentCountry
        ? `${residentCity}, ${residentCountry}`
        : residentCity ?? "—";

    return mutateDemoDb((db) => {
      if (
        db.clients.some(
          (record) =>
            record.client.email.toLowerCase() === email.toLowerCase(),
        )
      ) {
        throw new DemoApiError("A client with this email already exists.", 409);
      }

      const advisor = demoUserById(advisorId);
      const id = nextId("client");

      const client: Client = {
        id,
        firstName,
        lastName,
        email,
        phone: phoneNumber,
        status: isDirect ? "active" : "onboarding",
        riskLevel: "moderate",
        subscription: grantCore
          ? "celerey_core"
          : isDirect
            ? "free_trial"
            : "not_onboarded",
        aua: 0,
        aum: 0,
        currency: currency as Client["currency"],
        advisorId,
        advisorName: advisor?.name ?? ctx.user.name,
        location,
        lastContactAt: new Date().toISOString(),
        lastContactSource: "onboarding",
        reviewFrequencyDays: 180,
        nextReviewAt: daysFromNow(180),
        joinedAt: new Date().toISOString(),
        goalsCount: 0,
        segment: "emerging",
      };

      const emptyDetail: ClientDetailState = {
        user: {
          user_id: id,
          email,
          first_name:
            typeof identity?.first_name === "string"
              ? identity.first_name
              : firstName,
          last_name:
            typeof identity?.last_name === "string"
              ? identity.last_name
              : lastName,
          display_name: displayName,
          phone_number: phoneNumber || null,
          resident_country: residentCountry,
          resident_state:
            typeof identity?.resident_state === "string"
              ? identity.resident_state
              : null,
          city: residentCity,
          date_of_birth:
            typeof identity?.date_of_birth === "string"
              ? identity.date_of_birth
              : null,
          currency,
          occupation:
            typeof identity?.occupation === "string"
              ? identity.occupation
              : null,
          marital_status:
            typeof identity?.marital_status === "string"
              ? identity.marital_status
              : null,
          gender:
            typeof identity?.gender === "string" ? identity.gender : null,
          prefix: typeof identity?.prefix === "string" ? identity.prefix : null,
          dependents: 0,
          citizenships: [],
          risk_profile: "moderate",
          account_mode:
            typeof identity?.account_mode === "string"
              ? identity.account_mode
              : null,
          bio: null,
          is_active: true,
          user_type: "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        riskAssessment: null,
        incomeRows: [],
        expenseCategories: [],
        goals: [],
        goalsMeta: {
          totalMonthlyNeeded: 0,
          totalGoals: 0,
          completedGoals: 0,
          activeGoals: 0,
        },
        holdings: [],
        accounts: [],
        propertyAssets: [],
        liabilities: [],
        insurancePolicies: [],
        retirement: {
          currentAge: 40,
          retirementAge: 65,
          lifeExpectancy: 88,
          currentInvested: 0,
          monthlySavings: 0,
          existingPensionBalance: 0,
          monthlyPensionContribution: 0,
          expectedReturnPct: 7.5,
          inflationPct: 3.2,
          safeWithdrawalRatePct: 4,
          desiredMonthlyIncome: 0,
        },
        emergencyFund: {
          targetMonths: 6,
          currentCashBalance: 0,
          computed: { monthsCovered: 0, gap: 0 },
        },
        cashFlowHistory: [],
        cashFlowSummary: {
          monthly_income: 0,
          monthly_expenses: 0,
          monthly_surplus: 0,
          savings_rate_pct: 0,
          currency: "USD",
        },
        portfolioPerformance: [],
        allocation: [],
        taxProfile: null,
        dependents: [],
        freshness: [],
        profileCompletionScore: isDirect ? 35 : 15,
      };

      db.clients.push({
        client,
        detail: emptyDetail,
        internalNotes: [],
        subscription: client.subscription,
        segment: "emerging",
        idleCashPct: 0,
        targetCashPct: 5,
        heldAwayUsd: 0,
        portfolioDriftPct: 0,
        revenueQtdUsd: 0,
        netFlowQtdUsd: 0,
        performanceYtdPct: 0,
        lastEngagementDays: 0,
        maturingInvestment: null,
      });

      db.activity.unshift({
        id: nextId("activity"),
        clientId: id,
        clientName: displayName,
        type: "document",
        summary: isDirect
          ? "Client profile created by advisor"
          : "Client created and invite sent",
        occurredAt: new Date().toISOString(),
      });

      const advisorRecord = db.advisors.find(
        (candidate) => candidate.id === advisorId,
      );
      if (advisorRecord) {
        advisorRecord.clientCount += 1;
      }

      recordAudit(db, ctx.user, "client.created", {
        type: "client",
        id,
        label: `${firstName} ${lastName}`,
      });

      return {
        client,
        invite: isDirect
          ? null
          : {
              sent: true,
              inviteId: nextId("invite"),
              expiresAt: daysFromNow(7),
            },
      };
    });
  },

  "admin.clients.invite": (ctx) => {
    const clientId = bodyString(ctx, "client_id", "clientId");

    return {
      inviteId: nextId("invite"),
      clientId,
      email: "",
      status: "sent",
      expiresAt: daysFromNow(7),
      onboardingUrl: null,
    };
  },

  "admin.clients.assign-advisor": async (ctx) => {
    const clientId = bodyString(ctx, "client_id", "clientId");
    const advisorId = bodyString(ctx, "advisor_id", "advisorId");

    return mutateDemoDb((db) => {
      const record = db.clients.find(
        (candidate) => candidate.client.id === clientId,
      );

      if (!record) {
        throw new DemoApiError("Client not found.", 404);
      }

      const previousAdvisorId = record.client.advisorId;
      const advisor = demoUserById(advisorId);

      record.client.advisorId = advisorId;
      record.client.advisorName = advisor?.name ?? "Unassigned";

      for (const candidate of db.advisors) {
        if (candidate.id === previousAdvisorId) {
          candidate.clientCount = Math.max(0, candidate.clientCount - 1);
        }
        if (candidate.id === advisorId) {
          candidate.clientCount += 1;
        }
      }

      recordAudit(db, ctx.user, "assignment.changed", {
        type: "client",
        id: clientId,
        label: `Reassigned to ${advisor?.name ?? "Unassigned"}`,
      });

      return { clientId, advisorId };
    });
  },

  "admin.clients.update-subscription": async (ctx) => {
    const clientId = bodyString(ctx, "client_id", "clientId");
    const subscription = bodyString(ctx, "subscription");

    return mutateDemoDb((db) => {
      const record = db.clients.find(
        (candidate) => candidate.client.id === clientId,
      );

      if (!record) {
        throw new DemoApiError("Client not found.", 404);
      }

      record.client.subscription =
        subscription as DemoClientRecord["client"]["subscription"];
      record.subscription = record.client.subscription;

      recordAudit(db, ctx.user, "subscription.updated", {
        type: "client",
        id: clientId,
        label: `${fullName(record.client)} — ${subscription}`,
      });

      return { clientId, subscription };
    });
  },

  "admin.clients.availability.get": (ctx) => {
    const clientId = param(ctx, "clientId", "client_id");
    return ctx.db.availability[clientId] ?? null;
  },

  "admin.clients.availability.update": async (ctx) => {
    const clientId = bodyString(ctx, "clientId", "client_id");

    return mutateDemoDb((db) => {
      const next = {
        timezone: bodyString(ctx, "timezone") || "Africa/Accra",
        hoursStart: bodyString(ctx, "hoursStart") || "09:00",
        hoursEnd: bodyString(ctx, "hoursEnd") || "17:00",
        daysAvailable: Array.isArray(ctx.body.daysAvailable)
          ? (ctx.body.daysAvailable as string[])
          : ["mon", "tue", "wed", "thu", "fri"],
      };

      db.availability[clientId] = next as DemoDatabase["availability"][string];
      return next;
    });
  },

  "admin.clients.user.update": async (ctx) => {
    const clientId = bodyString(ctx, "client_id", "clientId");
    const data =
      ctx.body.data && typeof ctx.body.data === "object"
        ? (ctx.body.data as Record<string, unknown>)
        : ctx.body;

    if (!clientId) {
      throw new DemoApiError("Missing client.", 400);
    }

    return mutateDemoDb((db) => {
      const record = db.clients.find(
        (candidate) => candidate.client.id === clientId,
      );

      if (!record) {
        throw new DemoApiError("Client not found.", 404);
      }

      mutateClientProfileRecord(record, (entry) => {
        const user = entry.detail.user;
        if (typeof data.phone_number === "string") {
          user.phone_number = data.phone_number;
          entry.client.phone = data.phone_number;
        }
        if (typeof data.occupation === "string") {
          user.occupation = data.occupation;
        }
        if (typeof data.bio === "string") {
          user.bio = data.bio;
        }
        if (typeof data.preferred_contact === "string") {
          user.preferred_contact = data.preferred_contact;
        }
        if (typeof data.investment_currency === "string") {
          user.investment_currency = data.investment_currency;
        }
        if (typeof data.city === "string") {
          user.city = data.city;
          entry.client.location = user.resident_country
            ? `${data.city}, ${user.resident_country}`
            : data.city;
        }
        user.updated_at = new Date().toISOString();
      });

      return { updated: true, clientId };
    });
  },

  "admin.clients.internal-notes.update": async (ctx) => {
    const clientId = bodyString(ctx, "client_id", "clientId");
    const data =
      ctx.body.data && typeof ctx.body.data === "object"
        ? (ctx.body.data as Record<string, unknown>)
        : ctx.body;
    const body =
      typeof data.body === "string"
        ? data.body.trim()
        : typeof data.internal_notes === "string"
          ? data.internal_notes.trim()
          : typeof data.internalNotes === "string"
            ? data.internalNotes.trim()
            : "";

    if (!clientId) {
      throw new DemoApiError("Missing client.", 400);
    }

    if (!body) {
      throw new DemoApiError("Note body is required.", 400);
    }

    if (
      !canAccessClientRecord(
        ctx.db,
        { userId: ctx.user.id, demoRole: ctx.user.demoRole },
        clientId,
      )
    ) {
      throw new DemoApiError("Client not found.", 404);
    }

    return mutateDemoDb((db) => {
      const record = db.clients.find(
        (candidate) => candidate.client.id === clientId,
      );

      if (!record) {
        throw new DemoApiError("Client not found.", 404);
      }

      record.internalNotes = appendInternalNote(record.internalNotes ?? [], {
        id: nextProfileId("note"),
        body,
        authorId: ctx.user.id,
        authorName: ctx.user.name,
        createdAt: new Date().toISOString(),
      });

      recordAudit(db, ctx.user, "client.internal_notes.updated", {
        type: "client",
        id: clientId,
        label: `${record.client.firstName} ${record.client.lastName}`,
      });

      return { updated: true, clientId };
    });
  },

  "admin.clients.risk-assessment.submit": async (ctx) => {
    const clientId = bodyString(ctx, "client_id", "clientId");
    const data =
      ctx.body.data && typeof ctx.body.data === "object"
        ? (ctx.body.data as Record<string, unknown>)
        : ctx.body;
    const riskBand =
      typeof data.risk_band === "string"
        ? data.risk_band
        : typeof data.riskBand === "string"
          ? data.riskBand
          : "moderate";

    if (!clientId) {
      throw new DemoApiError("Missing client.", 400);
    }

    return mutateDemoDb((db) => {
      const record = db.clients.find(
        (candidate) => candidate.client.id === clientId,
      );

      if (!record) {
        throw new DemoApiError("Client not found.", 404);
      }

      mutateClientProfileRecord(record, (entry) => {
        entry.detail.riskAssessment = {
          assessment_id: nextProfileId("risk"),
          questionnaire_version: String(data.questionnaire_version ?? "v3"),
          responses:
            data.responses && typeof data.responses === "object"
              ? (data.responses as Record<string, number>)
              : { horizon: 3, drawdown: 3, liquidity: 3, experience: 3 },
          profile_snapshot: { band: riskBand },
          scoring: {
            time_horizon_avg: 3,
            questionnaire_score: 60,
            modifiers: {},
            modifier_total: 0,
            final_score: 60,
          },
          result: {
            risk_band: riskBand,
            description: String(
              data.description ??
                "Balanced growth and stability over a medium horizon.",
            ),
            strategy: String(
              data.strategy ??
                "Diversified multi-asset portfolio with moderate equity tilt.",
            ),
          },
          is_recalculation: Boolean(entry.detail.riskAssessment),
          created_at: new Date().toISOString(),
        };
        entry.detail.user.risk_profile = riskBand;
        if (
          riskBand === "conservative" ||
          riskBand === "moderate" ||
          riskBand === "growth" ||
          riskBand === "aggressive"
        ) {
          entry.client.riskLevel = riskBand;
        }
      });

      return {
        updated: true,
        assessmentId: record.detail.riskAssessment?.assessment_id,
      };
    });
  },

  "admin.advisors.find": (ctx) => {
    const query = param(ctx, "query").toLowerCase();
    const page = numberParam(ctx, "page", 1);
    const pageSize = numberParam(ctx, "pageSize", 20);

    const items = query
      ? ctx.db.advisors.filter(
          (advisor) =>
            advisor.name.toLowerCase().includes(query) ||
            advisor.email.toLowerCase().includes(query),
        )
      : ctx.db.advisors;

    return paginate(items, page, pageSize);
  },

  "admin.advisors.detail": (ctx) => {
    const advisorId = param(ctx, "advisor_id", "advisorId");
    const advisor = ctx.db.advisors.find(
      (candidate) => candidate.id === advisorId,
    );

    if (!advisor) {
      throw new DemoApiError("Advisor not found.", 404);
    }

    return advisor;
  },

  "admin.advisors.create": async (ctx) => {
    const name = bodyString(ctx, "name");
    const email = bodyString(ctx, "email");
    const role = bodyString(ctx, "role") || "advisor";

    return mutateDemoDb((db) => {
      const advisor = {
        id: nextId("staff"),
        name,
        email,
        role: role === "admin" ? ("admin" as const) : ("advisor" as const),
        roles: role === "admin" ? (["admin"] as const) : (["advisor"] as const),
        clientCount: 0,
        createdAt: new Date().toISOString(),
      };

      db.advisors.push({ ...advisor, roles: [...advisor.roles] });

      recordAudit(db, ctx.user, "staff.created", {
        type: "staff",
        id: advisor.id,
        label: name,
      });

      return advisor;
    });
  },

  "admin.roles.update": async (ctx) => {
    const staffId = bodyString(ctx, "staff_id", "staffId");
    const roles = Array.isArray(ctx.body.roles)
      ? (ctx.body.roles as string[])
      : [];

    return mutateDemoDb((db) => {
      const advisor = db.advisors.find(
        (candidate) => candidate.id === staffId,
      );

      if (!advisor) {
        throw new DemoApiError("Staff member not found.", 404);
      }

      advisor.roles = roles as typeof advisor.roles;
      advisor.role = roles.includes("super_admin")
        ? "super_admin"
        : roles.includes("admin")
          ? "admin"
          : "advisor";

      recordAudit(db, ctx.user, "roles.updated", {
        type: "staff",
        id: staffId,
        label: advisor.name,
      });

      return advisor;
    });
  },

  "admin.assignments.bulk-assign": async (ctx) => {
    const clientIds = Array.isArray(ctx.body.clientIds)
      ? (ctx.body.clientIds as string[])
      : [];
    const advisorId = bodyString(ctx, "advisorId", "advisor_id");

    return mutateDemoDb((db) => {
      const advisor = demoUserById(advisorId);
      let assignedCount = 0;
      const failedClientIds: string[] = [];

      for (const clientId of clientIds) {
        const record = db.clients.find(
          (candidate) => candidate.client.id === clientId,
        );

        if (!record) {
          failedClientIds.push(clientId);
          continue;
        }

        const previous = record.client.advisorId;
        record.client.advisorId = advisorId;
        record.client.advisorName = advisor?.name ?? "Unassigned";
        assignedCount += 1;

        for (const candidate of db.advisors) {
          if (candidate.id === previous) {
            candidate.clientCount = Math.max(0, candidate.clientCount - 1);
          }
          if (candidate.id === advisorId) {
            candidate.clientCount += 1;
          }
        }
      }

      recordAudit(db, ctx.user, "assignment.bulk", {
        type: "staff",
        id: advisorId,
        label: `${assignedCount} clients reassigned to ${advisor?.name ?? "Unassigned"}`,
      });

      return { assignedCount, failedClientIds };
    });
  },

  "admin.dashboard.summary": (ctx) => {
    const records = scopedClients(ctx.db, ctx.user);
    const totalAua = records.reduce(
      (total, record) => total + record.client.aua,
      0,
    );
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    const clientIds = new Set(records.map((record) => record.client.id));

    const riskLevels = [
      "conservative",
      "moderate",
      "growth",
      "aggressive",
    ] as const;
    const statuses = ["active", "onboarding", "review", "inactive"] as const;

    return {
      totalClients: records.length,
      activeClients: records.filter(
        (record) => record.client.status === "active",
      ).length,
      totalAua,
      reviewsDueThisWeek: records.filter((record) => {
        const next = Date.parse(record.client.nextReviewAt);
        return next >= now && next <= now + week;
      }).length,
      onboardingCount: records.filter(
        (record) => record.client.status === "onboarding",
      ).length,
      averageAua: records.length ? Math.round(totalAua / records.length) : 0,
      auaByRisk: riskLevels.map((riskLevel) => ({
        riskLevel,
        value: records
          .filter((record) => record.client.riskLevel === riskLevel)
          .reduce((total, record) => total + record.client.aua, 0),
      })),
      clientsByStatus: statuses.map((status) => ({
        status,
        count: records.filter((record) => record.client.status === status)
          .length,
      })),
      recentActivity: ctx.db.activity
        .filter((entry) => clientIds.has(entry.clientId))
        .slice(0, 8),
    };
  },

  "admin.reports.workload": (ctx) => ({
    items: ctx.db.advisors
      .filter((advisor) => advisor.clientCount > 0)
      .map((advisor) => ({
        advisorId: advisor.id,
        advisorName: advisor.name,
        clientCount: advisor.clientCount,
        activeClientCount: ctx.db.clients.filter(
          (record) =>
            record.client.advisorId === advisor.id &&
            record.client.status === "active",
        ).length,
      })),
  }),

  "admin.messages.threads.find": (ctx) => {
    const query = param(ctx, "query").toLowerCase();
    const clientIds = new Set(
      scopedClients(ctx.db, ctx.user).map((record) => record.client.id),
    );

    let threads = ctx.db.threads.filter((thread) =>
      clientIds.has(thread.clientId),
    );

    if (query) {
      threads = threads.filter((thread) =>
        thread.clientName.toLowerCase().includes(query),
      );
    }

    const sorted = [...threads].sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );

    return paginate(
      sorted,
      numberParam(ctx, "page", 1),
      numberParam(ctx, "pageSize", 50),
    );
  },

  "admin.messages.threads.get": (ctx) => {
    const threadId = param(ctx, "threadId", "thread_id");
    const thread = ctx.db.threads.find(
      (candidate) => candidate.id === threadId,
    );

    if (!thread) {
      throw new DemoApiError("Conversation not found.", 404);
    }

    return {
      thread,
      items: thread.messages,
      total: thread.messages.length,
      page: 1,
      pageSize: thread.messages.length,
      pageCount: 1,
    };
  },

  "admin.messages.threads.create": async (ctx) => {
    const clientId = bodyString(ctx, "clientId", "client_id");

    return mutateDemoDb((db) => {
      const existing = db.threads.find(
        (thread) => thread.clientId === clientId,
      );

      if (existing) {
        return existing;
      }

      const record = db.clients.find(
        (candidate) => candidate.client.id === clientId,
      );

      if (!record) {
        throw new DemoApiError("Client not found.", 404);
      }

      const thread = {
        id: nextId("thread"),
        clientId,
        clientName: fullName(record.client),
        clientEmail: record.client.email,
        advisorId: record.client.advisorId,
        updatedAt: new Date().toISOString(),
        unreadCount: 0,
        lastMessage: null,
        messages: [],
      };

      db.threads.unshift(thread);
      return thread;
    });
  },

  "admin.messages.messages.send": async (ctx) => {
    const threadId = bodyString(ctx, "threadId", "thread_id");
    const author = bodyString(ctx, "author") || "advisor";
    const body = bodyString(ctx, "body");

    return mutateDemoDb((db) => {
      const thread = db.threads.find(
        (candidate) => candidate.id === threadId,
      );

      if (!thread) {
        throw new DemoApiError("Conversation not found.", 404);
      }

      const message = {
        id: nextId("msg"),
        author: author === "note" ? ("note" as const) : ("advisor" as const),
        body,
        createdAt: new Date().toISOString(),
      };

      thread.messages.push(message);
      thread.lastMessage = message;
      thread.updatedAt = message.createdAt;

      if (author !== "note") {
        db.activity.unshift({
          id: nextId("activity"),
          clientId: thread.clientId,
          clientName: thread.clientName,
          type: "message",
          summary: `Message sent: ${body.slice(0, 60)}`,
          occurredAt: message.createdAt,
        });

        const record = db.clients.find(
          (candidate) => candidate.client.id === thread.clientId,
        );
        if (record) {
          recordClientContact(record, message.createdAt, "message", body.slice(0, 80));
        }

        recordAudit(db, ctx.user, "message.sent", {
          type: "client",
          id: thread.clientId,
          label: thread.clientName,
        });
      }

      return message;
    });
  },

  "admin.messages.threads.mark-read": async (ctx) => {
    const threadId = bodyString(ctx, "threadId", "thread_id");

    return mutateDemoDb((db) => {
      const thread = db.threads.find(
        (candidate) => candidate.id === threadId,
      );

      if (thread) {
        thread.unreadCount = 0;
      }

      return { threadId, unreadCount: 0 };
    });
  },

  "admin.documents.find": (ctx) => {
    const clientId = param(ctx, "clientId", "client_id");
    const category = param(ctx, "category") || "all";

    let items = ctx.db.documents.filter(
      (document) => document.clientId === clientId,
    );

    if (category !== "all") {
      items = items.filter((document) => document.category === category);
    }

    return {
      items: [...items].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      ),
    };
  },

  "admin.documents.upload": async (ctx) => {
    const formData = ctx.formData;

    if (!formData) {
      throw new DemoApiError("No file received.", 400);
    }

    const clientId = String(formData.get("clientId") ?? "");
    const file = formData.get("file");
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "other");

    if (!(file instanceof Blob)) {
      throw new DemoApiError("Choose a file to upload.", 400);
    }

    const fileName =
      file instanceof File && file.name ? file.name : "document.pdf";

    return mutateDemoDb((db) => {
      const record = db.clients.find(
        (candidate) => candidate.client.id === clientId,
      );

      if (!record) {
        throw new DemoApiError("Client not found.", 404);
      }

      const document = {
        id: nextId("doc"),
        clientId,
        sessionId: null,
        title: title || fileName,
        category: category as DemoDatabase["documents"][number]["category"],
        fileName,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        uploadedBy: "advisor" as const,
        uploadedByName: ctx.user.name,
        createdAt: new Date().toISOString(),
        downloadUrl: "#",
        downloadUrlExpiresAt: daysFromNow(1),
      };

      db.documents.unshift(document);

      db.activity.unshift({
        id: nextId("activity"),
        clientId,
        clientName: fullName(record.client),
        type: "document",
        summary: `Document uploaded: ${document.title}`,
        occurredAt: document.createdAt,
      });

      recordAudit(db, ctx.user, "document.uploaded", {
        type: "client",
        id: clientId,
        label: document.title,
      });

      return document;
    });
  },

  "admin.documents.delete": async (ctx) => {
    const documentId = param(ctx, "documentId", "document_id");

    return mutateDemoDb((db) => {
      const index = db.documents.findIndex(
        (document) => document.id === documentId,
      );

      if (index >= 0) {
        db.documents.splice(index, 1);
      }

      return { deleted: true };
    });
  },

  "admin.appointments.find": (ctx) => {
    const status = param(ctx, "status") || "all";
    const clientId = param(ctx, "clientId", "client_id");
    const clientIds = new Set(
      scopedClients(ctx.db, ctx.user).map((record) => record.client.id),
    );

    let items = ctx.db.appointments.filter((appointment) =>
      clientIds.has(appointment.clientId),
    );

    if (clientId) {
      items = items.filter(
        (appointment) => appointment.clientId === clientId,
      );
    }

    if (status !== "all") {
      items = items.filter((appointment) => appointment.status === status);
    }

    return { items };
  },

  "admin.appointments.create": async (ctx) => {
    const clientId = bodyString(ctx, "clientId");

    return mutateDemoDb((db) => {
      const record = db.clients.find(
        (candidate) => candidate.client.id === clientId,
      );

      if (!record) {
        throw new DemoApiError("Client not found.", 404);
      }

      const durationRaw = Number(ctx.body.durationMinutes);
      const appointment = {
        id: nextId("appt"),
        clientId,
        clientName: fullName(record.client),
        advisorId: record.client.advisorId,
        advisorName: record.client.advisorName,
        planYear: String(new Date().getFullYear()),
        type: (bodyString(ctx, "type") ||
          "review") as DemoDatabase["appointments"][number]["type"],
        title: bodyString(ctx, "title") || "Client meeting",
        scheduledAt: bodyString(ctx, "scheduledAt") || null,
        durationMinutes: Number.isFinite(durationRaw) ? durationRaw : 45,
        status: "upcoming" as const,
        createdBy: "advisor" as const,
        log: null,
        progress: null,
        actionIds: [],
        documentIds: [],
      };

      db.appointments.unshift(appointment);

      recordAudit(db, ctx.user, "appointment.created", {
        type: "client",
        id: clientId,
        label: appointment.title,
      });

      return appointment;
    });
  },

  "admin.appointments.confirm": async (ctx) => {
    const appointmentId = bodyString(ctx, "appointmentId");
    const scheduledAt = bodyString(ctx, "scheduledAt");

    return mutateDemoDb((db) => {
      const appointment = db.appointments.find(
        (candidate) => candidate.id === appointmentId,
      );

      if (!appointment) {
        throw new DemoApiError("Appointment not found.", 404);
      }

      appointment.status = "scheduled";
      if (scheduledAt) {
        appointment.scheduledAt = scheduledAt;
      }
      appointment.calendarSynced = true;
      appointment.meetingUrl =
        appointment.meetingUrl ?? "https://meet.google.com/demo-celerey-session";
      appointment.meetingProvider = appointment.meetingProvider ?? "google_meet";

      return appointment;
    });
  },

  "admin.appointments.update-status": async (ctx) => {
    const appointmentId = bodyString(ctx, "appointmentId");
    const status = bodyString(ctx, "status");
    const scheduledAt = bodyString(ctx, "scheduledAt");

    return mutateDemoDb((db) => {
      const appointment = db.appointments.find(
        (candidate) => candidate.id === appointmentId,
      );

      if (!appointment) {
        throw new DemoApiError("Appointment not found.", 404);
      }

      appointment.status =
        status as DemoDatabase["appointments"][number]["status"];

      if (scheduledAt) {
        appointment.scheduledAt = scheduledAt;
      }

      if (status === "counter_proposed") {
        appointment.proposedBy = "advisor";
      }

      return appointment;
    });
  },

  "admin.appointments.publish-notes": async (ctx) => {
    const appointmentId = bodyString(ctx, "appointmentId");

    return mutateDemoDb((db) => {
      const appointment = db.appointments.find(
        (candidate) => candidate.id === appointmentId,
      );

      if (!appointment) {
        throw new DemoApiError("Appointment not found.", 404);
      }

      const draft = appointment.aiNotesDraft;
      if (!draft) {
        throw new DemoApiError("No AI notes draft to publish.", 400);
      }

      const discussionPoints = Array.isArray(ctx.body.discussionPoints)
        ? (ctx.body.discussionPoints as string[])
            .map((item) => String(item).trim())
            .filter(Boolean)
        : draft.discussionPoints;

      const actionItemsRaw = Array.isArray(ctx.body.actionItems)
        ? (ctx.body.actionItems as Array<Record<string, unknown>>)
        : [];

      const actionItems = actionItemsRaw
        .map((item) => ({
          title: String(item.title ?? "").trim(),
          owner: String(item.owner ?? "").trim(),
          dueAt:
            typeof item.dueAt === "string" && item.dueAt
              ? item.dueAt
              : null,
        }))
        .filter((item) => item.title);

      appointment.aiNotesPublished = {
        ...draft,
        summary: bodyString(ctx, "summary") || draft.summary,
        discussionPoints,
        actionItems:
          actionItems.length > 0 ? actionItems : draft.actionItems,
      };
      appointment.status = "published";
      appointment.notesVisibility = "published";
      appointment.publishedAt = new Date().toISOString();
      appointment.reviewedAt = new Date().toISOString();
      appointment.transcriptStatus = "ready";

      recordAudit(db, ctx.user, "meeting_notes.published", {
        type: "client",
        id: appointment.clientId,
        label: appointment.title,
      });

      return appointment;
    });
  },

  "admin.appointments.log": async (ctx) => {
    const appointmentId = bodyString(ctx, "appointmentId");

    return mutateDemoDb((db) => {
      const appointment = db.appointments.find(
        (candidate) => candidate.id === appointmentId,
      );

      if (!appointment) {
        throw new DemoApiError("Appointment not found.", 404);
      }

      const recommendations = Array.isArray(ctx.body.recommendations)
        ? (ctx.body.recommendations as Array<{ title?: string }>)
            .map((item) => ({ title: String(item?.title ?? "") }))
            .filter((item) => item.title)
        : [];

      appointment.log = {
        title: bodyString(ctx, "title") || appointment.title,
        tags: Array.isArray(ctx.body.tags) ? (ctx.body.tags as string[]) : [],
        advisorAssessment: bodyString(ctx, "advisorAssessment"),
        discussionPoints: Array.isArray(ctx.body.discussionPoints)
          ? (ctx.body.discussionPoints as string[])
          : [],
        recommendations,
        sessionNotes: bodyString(ctx, "sessionNotes"),
      };
      appointment.status = "completed";

      const actions = Array.isArray(ctx.body.actions)
        ? (ctx.body.actions as Array<Record<string, unknown>>)
        : [];

      for (const action of actions) {
        const taskId = nextId("task");
        appointment.actionIds.push(taskId);
        db.tasks.unshift({
          id: taskId,
          title: String(action.title ?? "Follow up"),
          description: null,
          clientId: appointment.clientId,
          clientName: appointment.clientName,
          sessionId: appointment.id,
          assignee: "advisor",
          category: (action.category ??
            "other") as DemoDatabase["tasks"][number]["category"],
          dueAt:
            typeof action.dueAt === "string" ? action.dueAt : daysFromNow(7),
          priority: (action.priority ??
            "medium") as DemoDatabase["tasks"][number]["priority"],
          status: "open",
        });
      }

      const entitlement = db.entitlements[appointment.clientId];
      if (entitlement) {
        entitlement.used += 1;
        entitlement.remaining = Math.max(
          0,
          entitlement.included - entitlement.used,
        );
      }

      const clientRecord = db.clients.find(
        (candidate) => candidate.client.id === appointment.clientId,
      );
      if (clientRecord) {
        recordClientContact(
          clientRecord,
          new Date().toISOString(),
          "session_logged",
          appointment.title,
        );
      }

      recordAudit(db, ctx.user, "session.logged", {
        type: "client",
        id: appointment.clientId,
        label: appointment.title,
      });

      return appointment;
    });
  },

  "admin.appointments.slots.find": (ctx) => {
    const from = param(ctx, "from");
    const start = from ? new Date(from) : new Date();
    const items: Array<{
      startAt: string;
      endAt: string;
      durationMinutes: number;
    }> = [];

    for (let day = 0; day < 10; day += 1) {
      for (const hour of [9, 11, 14, 16]) {
        const slotStart = new Date(start);
        slotStart.setDate(slotStart.getDate() + day);
        slotStart.setHours(hour, 0, 0, 0);

        if (slotStart.getDay() === 0 || slotStart.getDay() === 6) {
          continue;
        }

        const slotEnd = new Date(slotStart.getTime() + 45 * 60 * 1000);
        items.push({
          startAt: slotStart.toISOString(),
          endAt: slotEnd.toISOString(),
          durationMinutes: 45,
        });
      }
    }

    return { timezone: "Africa/Accra", items };
  },

  "admin.advisory.entitlement.get": (ctx) => {
    const clientId = param(ctx, "clientId", "client_id");

    return (
      ctx.db.entitlements[clientId] ?? {
        planYear: String(new Date().getFullYear()),
        included: 4,
        used: 0,
        remaining: 4,
      }
    );
  },

  "admin.advisory.entitlement.update": async (ctx) => {
    const clientId = bodyString(ctx, "clientId", "client_id");
    const includedRaw = Number(ctx.body.included);

    return mutateDemoDb((db) => {
      const current = db.entitlements[clientId] ?? {
        planYear: String(new Date().getFullYear()),
        included: 4,
        used: 0,
        remaining: 4,
      };

      const included = Number.isFinite(includedRaw)
        ? includedRaw
        : current.included;

      const next = {
        ...current,
        included,
        remaining: Math.max(0, included - current.used),
      };

      db.entitlements[clientId] = next;
      return next;
    });
  },

  "admin.tasks.find": (ctx) => {
    const status = param(ctx, "status") || "all";
    const clientId = param(ctx, "clientId", "client_id");
    const clientIds = new Set(
      scopedClients(ctx.db, ctx.user).map((record) => record.client.id),
    );

    let items = ctx.db.tasks.filter(
      (task) => !task.clientId || clientIds.has(task.clientId),
    );

    if (clientId) {
      items = items.filter((task) => task.clientId === clientId);
    }

    if (status !== "all") {
      items = items.filter((task) => task.status === status);
    }

    return { items };
  },

  "admin.tasks.create": async (ctx) => {
    const clientId = bodyString(ctx, "clientId", "client_id");

    return mutateDemoDb((db) => {
      const record = clientId
        ? db.clients.find((candidate) => candidate.client.id === clientId)
        : undefined;

      const task = {
        id: nextId("task"),
        title: bodyString(ctx, "title") || "Follow up",
        description: bodyString(ctx, "description") || null,
        clientId: clientId || null,
        clientName: record ? fullName(record.client) : null,
        sessionId: null,
        assignee: (bodyString(ctx, "assignee") ||
          "advisor") as DemoDatabase["tasks"][number]["assignee"],
        category: (bodyString(ctx, "category") ||
          "other") as DemoDatabase["tasks"][number]["category"],
        dueAt: bodyString(ctx, "dueAt") || null,
        priority: (bodyString(ctx, "priority") ||
          "medium") as DemoDatabase["tasks"][number]["priority"],
        status: "open" as const,
      };

      db.tasks.unshift(task);
      return task;
    });
  },

  "admin.tasks.update-status": async (ctx) => {
    const taskId = bodyString(ctx, "taskId", "task_id");
    const status = bodyString(ctx, "status");

    return mutateDemoDb((db) => {
      const task = db.tasks.find((candidate) => candidate.id === taskId);

      if (!task) {
        throw new DemoApiError("Task not found.", 404);
      }

      task.status = status === "done" ? "done" : "open";
      return task;
    });
  },

  "admin.settings.profile.get": (ctx) => {
    const settings = ctx.db.settings[ctx.user.id];

    return {
      displayName: settings?.displayName ?? ctx.user.name,
      title: settings?.title ?? ctx.user.title,
      phone: settings?.phone ?? "",
      bio: settings?.bio ?? "",
      country: settings?.country ?? "GH",
      timezone: settings?.timezone ?? "Africa/Accra",
      avatarUrl: settings?.avatarDataUrl ?? "",
    };
  },

  "admin.settings.profile.update": async (ctx) => {
    return mutateDemoDb((db) => {
      const current = db.settings[ctx.user.id];

      if (current) {
        current.displayName = bodyString(ctx, "displayName") || current.displayName;
        current.title = bodyString(ctx, "title");
        current.phone = bodyString(ctx, "phone");
        current.bio = bodyString(ctx, "bio");
        current.country = bodyString(ctx, "country") || current.country;
        current.timezone = bodyString(ctx, "timezone") || current.timezone;
      }

      return { updated: true };
    });
  },

  "admin.settings.profile.avatar.upload": () => ({ avatarUrl: "" }),

  "admin.settings.notifications.get": (ctx) =>
    ctx.db.settings[ctx.user.id]?.notifications ?? {},

  "admin.settings.notifications.update": async (ctx) => {
    return mutateDemoDb((db) => {
      const current = db.settings[ctx.user.id];

      if (current) {
        current.notifications = {
          clientAssigned: ctx.body.clientAssigned === true,
          clientMessage: ctx.body.clientMessage === true,
          appointmentReminder: ctx.body.appointmentReminder === true,
          taskReminder: ctx.body.taskReminder === true,
          documentUploaded: ctx.body.documentUploaded === true,
          goalUpdate: ctx.body.goalUpdate === true,
        };
      }

      return { updated: true };
    });
  },

  "admin.settings.availability.get": (ctx) => {
    const settings = ctx.db.settings[ctx.user.id];

    return {
      workingHoursStart: settings?.workingHoursStart ?? "09:00",
      workingHoursEnd: settings?.workingHoursEnd ?? "17:00",
      daysAvailable: settings?.daysAvailable ?? ["mon", "tue", "wed", "thu", "fri"],
      appointmentDurationMinutes: settings?.appointmentDurationMinutes ?? 30,
      appointmentBufferMinutes: settings?.appointmentBufferMinutes ?? 10,
    };
  },

  "admin.settings.availability.update": async (ctx) => {
    return mutateDemoDb((db) => {
      const current = db.settings[ctx.user.id];

      if (current) {
        current.workingHoursStart =
          bodyString(ctx, "workingHoursStart") || current.workingHoursStart;
        current.workingHoursEnd =
          bodyString(ctx, "workingHoursEnd") || current.workingHoursEnd;
        current.daysAvailable = Array.isArray(ctx.body.daysAvailable)
          ? (ctx.body.daysAvailable as typeof current.daysAvailable)
          : current.daysAvailable;

        const duration = Number(ctx.body.appointmentDurationMinutes);
        const buffer = Number(ctx.body.appointmentBufferMinutes);

        if (Number.isFinite(duration)) {
          current.appointmentDurationMinutes = duration;
        }
        if (Number.isFinite(buffer)) {
          current.appointmentBufferMinutes = buffer;
        }
      }

      return { updated: true };
    });
  },

  "admin.audit-logs.find": (ctx) => {
    const actorId = param(ctx, "actorId");
    const targetType = param(ctx, "targetType");

    let items = ctx.db.auditLogs;

    if (actorId) {
      items = items.filter((entry) => entry.actorId === actorId);
    }

    if (targetType) {
      items = items.filter((entry) => entry.targetType === targetType);
    }

    return paginate(
      items,
      numberParam(ctx, "page", 1),
      numberParam(ctx, "pageSize", 20),
    );
  },

  "admin.advisors.onboarding.get": () => {
    throw new DemoApiError("Onboarding invites are not used in the demo.", 404);
  },
};

export class DemoApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "DemoApiError";
    this.status = status;
  }
}

export type DemoRouterResult =
  | { ok: true; data: unknown; status: number }
  | { ok: false; message: string; status: number };

/**
 * Serves an API usecase from the local demo store. Returns null when the
 * usecase is not handled so the caller can fall through to the real API.
 */
export async function routeDemoUsecase(
  usecase: string,
  options: {
    accessToken?: string;
    body?: unknown;
    searchParams?: Params;
    formData?: FormData;
  },
): Promise<DemoRouterResult | null> {
  const handler = HANDLERS[usecase];

  if (!handler) {
    return null;
  }

  const user =
    userFromToken(options.accessToken) ??
    (usecase.startsWith("auth.") ? DEMO_USERS[0] : null);

  if (!user) {
    return { ok: false, message: "Invalid or expired session.", status: 401 };
  }

  try {
    const db = await readDemoDb();
    const data = await handler({
      db,
      user,
      body:
        options.body && typeof options.body === "object"
          ? (options.body as Record<string, unknown>)
          : {},
      params: options.searchParams ?? {},
      formData: options.formData ?? null,
    });

    return { ok: true, data, status: 200 };
  } catch (error) {
    if (error instanceof DemoApiError) {
      return { ok: false, message: error.message, status: error.status };
    }

    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Demo request failed.",
      status: 500,
    };
  }
}

export { scopedClients, userFromToken, deriveAlerts };
