"use client";

import { useActionState, useState, type FormEvent } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { verifyOtp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { EmailFormSchema } from "@/lib/definitions";


const darkInput =
  "h-11 border-white/20 bg-white/5 text-white placeholder:text-white/40";
const darkPrimaryButton =
  "h-11 w-full bg-white text-primary hover:bg-white/90";
const darkGhostButton = "w-full text-white/70 hover:bg-white/10 hover:text-white";
const darkOtpSlot = "size-11 border-white/20 text-white";

export function LoginForm() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [state, action, pending] = useActionState(verifyOtp, undefined);

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validated = EmailFormSchema.safeParse({ email });

    if (!validated.success) {
      setEmailError(
        validated.error.flatten().fieldErrors.email?.[0] ??
          "Enter a valid email address.",
      );
      return;
    }

    setEmailError(null);
    setEmail(validated.data.email);
    setStep("otp");
  }

  if (step === "otp") {
    return (
      <form action={action} className="space-y-6">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="otp" value={otp} />

        <div className="space-y-2">
          <Label htmlFor="otp" className="text-white/80">
            Verification code
          </Label>
          <p className="text-sm text-white/60">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium text-white">{email}</span>
          </p>
          <InputOTP
            id="otp"
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={otp}
            onChange={setOtp}
            autoFocus
            aria-invalid={Boolean(state?.errors?.otp)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className={darkOtpSlot} />
              <InputOTPSlot index={1} className={darkOtpSlot} />
              <InputOTPSlot index={2} className={darkOtpSlot} />
              <InputOTPSlot index={3} className={darkOtpSlot} />
              <InputOTPSlot index={4} className={darkOtpSlot} />
              <InputOTPSlot index={5} className={darkOtpSlot} />
            </InputOTPGroup>
          </InputOTP>
          {state?.errors?.otp ? (
            <p className="text-xs text-red-300">{state.errors.otp[0]}</p>
          ) : null}
        </div>

        {state?.message ? (
          <p
            className="rounded-md border border-red-300/30 bg-red-400/10 px-3 py-2 text-sm text-red-200"
            role="alert"
          >
            {state.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            className={darkPrimaryButton}
            disabled={pending || otp.length !== 6}
          >
            {pending ? "Verifying..." : "Next"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={darkGhostButton}
            onClick={() => {
              setStep("email");
              setOtp("");
            }}
          >
            Use a different email
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/80">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@celerey.co"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          aria-invalid={Boolean(emailError)}
          className={darkInput}
        />
        {emailError ? (
          <p className="text-xs text-red-300">{emailError}</p>
        ) : null}
      </div>

      <Button type="submit" className={darkPrimaryButton}>
        Send verification code
      </Button>
    </form>
  );
}
