import { z } from "zod";
import { countryHasStates } from "@/lib/clients/location-options";
import type { ActingRole, RoleScope, StaffRole } from "@/lib/auth/roles";
import type { DemoRole } from "@/lib/auth/capabilities";

export const LoginRoleSchema = z.enum(["advisor", "admin", "super_admin"], {
  error: "Choose whether you are signing in as an advisor, admin, or super admin.",
});

export const EmailFormSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim(),
  role: LoginRoleSchema,
});

export const OtpFormSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim(),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { error: "Enter the 6-digit code." }),
  role: LoginRoleSchema,
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        otp?: string[];
        role?: string[];
      };
      message?: string;
    }
  | undefined;

export type RequestOtpFormState =
  | {
      errors?: {
        email?: string[];
        role?: string[];
      };
      message?: string;
      success?: boolean;
      email?: string;
      role?: StaffRole;
    }
  | undefined;

export const AdvisorOnboardingProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, { error: "Name is required." })
    .max(80, { error: "Name is too long." }),
  title: z
    .string()
    .trim()
    .min(1, { error: "Job title is required." })
    .max(80, { error: "Job title is too long." }),
  phone: z
    .string()
    .trim()
    .min(7, { error: "Enter a valid phone number." })
    .max(30, { error: "Phone number is too long." }),
  bio: z.string().trim().max(500, { error: "Bio is too long." }).optional(),
  country: z.string().trim().min(2).max(2),
  timezone: z.string().trim().min(1),
});

export type AdvisorOnboardingFormState =
  | {
      errors?: {
        displayName?: string[];
        title?: string[];
        phone?: string[];
        bio?: string[];
        country?: string[];
        timezone?: string[];
      };
      message?: string;
    }
  | undefined;

export type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  accessToken: string;
  role: StaffRole;
  expiresAt: string;
  trueRoles: StaffRole[];
  activeRole: ActingRole | null;
  isSuperAdmin: boolean;
  availableRoles: StaffRole[];
  scope: RoleScope;
  /** Drives the capability matrix. Present whenever the portal runs in demo mode. */
  demoRole?: DemoRole;
};

export const CoreDurationDaysSchema = z.coerce
  .number()
  .int({ error: "Duration must be a whole number of days." })
  .min(1, { error: "Duration must be at least 1 day." })
  .max(3650, { error: "Duration can't exceed 3650 days (~10 years)." });

export const CreateClientModeSchema = z.enum(["invite", "direct"]);

export const AccountModeSchema = z.enum(["solo", "partner", "family"]);

const createClientSharedFields = {
  email: z.email({ error: "Enter a valid email address." }).trim(),
  grantCore: z.boolean(),
  durationDays: CoreDurationDaysSchema,
  advisorId: z.string().trim().optional(),
};

const InviteClientFieldsSchema = z.object({
  creationMode: z.literal("invite"),
  firstName: z
    .string()
    .trim()
    .min(1, { error: "First name is required." })
    .max(60, { error: "First name is too long." }),
  lastName: z
    .string()
    .trim()
    .min(1, { error: "Last name is required." })
    .max(60, { error: "Last name is too long." }),
  ...createClientSharedFields,
});

const DirectClientFieldsSchema = z
  .object({
    creationMode: z.literal("direct"),
    accountMode: AccountModeSchema,
    firstName: z.string().trim().max(25).optional(),
    lastName: z.string().trim().max(25).optional(),
    displayName: z.string().trim().max(100).optional(),
    dateOfBirth: z.string().trim().optional(),
    phoneNumber: z
      .string()
      .trim()
      .min(7, { error: "Enter a valid phone number." })
      .max(30, { error: "Phone number is too long." }),
    residentCountry: z
      .string()
      .trim()
      .length(2, { error: "Choose a country." }),
    residentState: z.string().trim().optional(),
    residentCity: z
      .string()
      .trim()
      .min(1, { error: "City is required." })
      .max(80, { error: "City is too long." }),
    currency: z
      .string()
      .trim()
      .length(3, { error: "Choose a currency." }),
    prefix: z.string().trim().optional(),
    gender: z.enum(["M", "F", "O", "X"]).optional(),
    maritalStatus: z
      .enum(["single", "married", "divorced", "widowed", "separated"])
      .optional(),
    occupation: z.string().trim().max(50).optional(),
    ...createClientSharedFields,
  })
  .superRefine((data, ctx) => {
    if (
      countryHasStates(data.residentCountry) &&
      !data.residentState?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["residentState"],
        message: "State / region is required for this country.",
      });
    }

    if (data.accountMode === "solo") {
      if (!data.firstName?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["firstName"],
          message: "First name is required.",
        });
      }
      if (!data.lastName?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["lastName"],
          message: "Last name is required.",
        });
      }
      if (!data.dateOfBirth?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["dateOfBirth"],
          message: "Date of birth is required.",
        });
      } else {
        const birthDate = new Date(data.dateOfBirth);
        const minimumAgeCutoff = new Date();
        minimumAgeCutoff.setFullYear(minimumAgeCutoff.getFullYear() - 16);

        if (
          Number.isNaN(birthDate.getTime()) ||
          birthDate > minimumAgeCutoff
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["dateOfBirth"],
            message: "Client must be at least 16 years old.",
          });
        }
      }
    } else if (!data.displayName?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["displayName"],
        message: "Household name is required.",
      });
    }
  });

export const CreateClientFormSchema = z.discriminatedUnion("creationMode", [
  InviteClientFieldsSchema,
  DirectClientFieldsSchema,
]);

export type CreateClientFormState =
  | {
      errors?: {
        firstName?: string[];
        lastName?: string[];
        displayName?: string[];
        dateOfBirth?: string[];
        email?: string[];
        accountMode?: string[];
        phoneNumber?: string[];
        residentCountry?: string[];
        residentState?: string[];
        residentCity?: string[];
        currency?: string[];
        prefix?: string[];
        gender?: string[];
        maritalStatus?: string[];
        occupation?: string[];
        grantCore?: string[];
        durationDays?: string[];
        advisorId?: string[];
      };
      message?: string;
      success?: boolean;
      creationMode?: "invite" | "direct";
    }
  | undefined;

export const CreateAdvisorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Name is required." })
    .max(80, { error: "Name is too long." }),
  email: z.email({ error: "Enter a valid email address." }).trim(),
  role: z.enum(["advisor", "admin"]).default("advisor"),
});

export type CreateAdvisorFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        role?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export const AssignAdvisorSchema = z.object({
  clientId: z.string().min(1),
  advisorId: z.string().trim().nullable(),
});

export type AssignAdvisorFormState =
  | {
      errors?: {
        advisorId?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export const BulkAssignSchema = z.object({
  clientIds: z.array(z.string().min(1)).min(1, {
    error: "Select at least one client.",
  }),
  advisorId: z.string().min(1, { error: "Choose an advisor." }),
});

export type BulkAssignFormState =
  | {
      message?: string;
      success?: boolean;
    }
  | undefined;

/**
 * Presets shown in the Core duration picker. `key` is the value the <Select>
 * controls; `days` is the number of days actually sent to the API. Only the
 * "custom" preset asks the user to type a raw day count directly.
 */
export const CORE_DURATION_PRESETS = [
  { key: "month", label: "1 month", days: 30 },
  { key: "quarter", label: "3 months", days: 90 },
  { key: "half_year", label: "6 months", days: 180 },
  { key: "year", label: "1 year", days: 365 },
  { key: "custom", label: "Custom", days: null },
] as const;

export type CoreDurationPresetKey =
  (typeof CORE_DURATION_PRESETS)[number]["key"];

export const DEFAULT_CORE_DURATION_PRESET_KEY: CoreDurationPresetKey = "year";
export const DEFAULT_CORE_DURATION_DAYS = "365";

export const UpdateSubscriptionSchema = z
  .object({
    clientId: z.string().min(1),
    subscription: z.enum(["not_onboarded", "free_trial", "celerey_core"]),
    durationDays: z.preprocess(
      (value) =>
        value === null || value === undefined || value === ""
          ? undefined
          : value,
      CoreDurationDaysSchema.optional(),
    ),
  })
  .refine(
    (data) => data.subscription !== "celerey_core" || data.durationDays != null,
    {
      error: "Duration is required for Celerey Core.",
      path: ["durationDays"],
    },
  );

export type UpdateSubscriptionFormState =
  | {
      errors?: {
        subscription?: string[];
        durationDays?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;
