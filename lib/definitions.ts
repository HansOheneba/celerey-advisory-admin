import { z } from "zod";

export const EmailFormSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim(),
});

export const OtpFormSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim(),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { error: "Enter the 6-digit code." }),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        otp?: string[];
      };
      message?: string;
    }
  | undefined;

export type RequestOtpFormState =
  | {
      errors?: {
        email?: string[];
      };
      message?: string;
      success?: boolean;
      email?: string;
    }
  | undefined;

export type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  accessToken: string;
  expiresAt: string;
};

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
  phone: z
    .string()
    .trim()
    .max(30, { error: "Phone number is too long." }),
  grantCore: z.boolean(),
  durationDays: z.coerce
    .number()
    .int({ error: "Duration must be a whole number of days." })
    .min(1, { error: "Duration must be at least 1 day." })
    .max(3650, { error: "Duration can't exceed 3650 days (~10 years)." }),
});

export type CreateClientFormState =
  | {
      errors?: {
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        phone?: string[];
        grantCore?: string[];
        durationDays?: string[];
      };
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

export const UpdateSubscriptionSchema = z.object({
  clientId: z.string().min(1),
  subscription: z.enum(["not_onboarded", "free_trial", "celerey_core"]),
});

export type UpdateSubscriptionFormState =
  | {
      errors?: {
        subscription?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;
