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
  sendInvite: z.boolean(),
  grantCore: z.boolean(),
});

export type CreateClientFormState =
  | {
      errors?: {
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        phone?: string[];
        sendInvite?: string[];
        grantCore?: string[];
      };
      message?: string;
      success?: boolean;
      inviteSent?: boolean;
    }
  | undefined;

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
