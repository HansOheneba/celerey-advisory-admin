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

export type SessionPayload = {
  userId: string;
  name: string;
  email: string;
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
});

export type CreateClientFormState =
  | {
      errors?: {
        firstName?: string[];
        lastName?: string[];
        email?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;
