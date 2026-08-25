import { z } from "zod";
import type { ActingRole, RoleScope, StaffRole } from "@/lib/auth/roles";

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
};

export const CoreDurationDaysSchema = z.coerce
  .number()
  .int({ error: "Duration must be a whole number of days." })
  .min(1, { error: "Duration must be at least 1 day." })
  .max(3650, { error: "Duration can't exceed 3650 days (~10 years)." });

export const CreateClientFormSchema = z.object({
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
  email: z.email({ error: "Enter a valid email address." }).trim(),
  grantCore: z.boolean(),
  durationDays: CoreDurationDaysSchema,
  advisorId: z.string().trim().optional(),
});

export type CreateClientFormState =
  | {
      errors?: {
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        grantCore?: string[];
        durationDays?: string[];
        advisorId?: string[];
      };
      message?: string;
      success?: boolean;
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
