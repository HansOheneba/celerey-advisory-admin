"use client";

import { useActionState, useState, useTransition } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { requestOtp, verifyOtp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

const darkInput =
  "h-11 border-white/20 bg-white/5 text-white placeholder:text-white/40";
const darkPrimaryButton =
  "h-11 w-full bg-white text-primary hover:bg-white/90";
const darkGhostButton = "w-full text-white/70 hover:bg-white/10 hover:text-white";
const darkOtpSlot = "size-11 border-white/20 text-white";

export function LoginForm() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendPending, startResend] = useTransition();
  const [otpState, otpAction, otpPending] = useActionState(verifyOtp, undefined);
  const [requestState, requestAction, requestPending] = useActionState(
    requestOtp,
    undefined,
  );

  // Advance to the OTP step as soon as a new successful requestState
  // is produced, without waiting for a post-render effect.
  const [handledRequestState, setHandledRequestState] = useState(requestState);
  if (requestState !== handledRequestState) {
    setHandledRequestState(requestState);

    if (requestState?.success && requestState.email) {
      setEmail(requestState.email);
      setStep("otp");
      setOtp("");
    }
  }

  function handleResend() {
    const formData = new FormData();
    formData.set("email", email);
    startResend(() => {
      requestAction(formData);
    });
  }

  if (step === "otp") {
    return (
      <form action={otpAction} className="space-y-6">
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
            aria-invalid={Boolean(otpState?.errors?.otp)}
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
          {otpState?.errors?.otp ? (
            <p className="text-xs text-red-300">{otpState.errors.otp[0]}</p>
          ) : null}
        </div>

        {otpState?.message ? (
          <p
            className="rounded-md border border-red-300/30 bg-red-400/10 px-3 py-2 text-sm text-red-200"
            role="alert"
          >
            {otpState.message}
          </p>
        ) : null}

        {requestState?.message && !requestState.success ? (
          <p
            className="rounded-md border border-red-300/30 bg-red-400/10 px-3 py-2 text-sm text-red-200"
            role="alert"
          >
            {requestState.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            className={darkPrimaryButton}
            disabled={otpPending || otp.length !== 6}
          >
            {otpPending ? "Verifying..." : "Next"}
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
          <Button
            type="button"
            variant="ghost"
            className={darkGhostButton}
            onClick={handleResend}
            disabled={resendPending || requestPending}
          >
            {resendPending || requestPending ? "Sending..." : "Resend code"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form action={requestAction} className="space-y-5">
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
          defaultValue={email}
          required
          aria-invalid={Boolean(
            requestState?.errors?.email ||
              (requestState?.message && !requestState.success),
          )}
          className={darkInput}
        />
        {requestState?.errors?.email ? (
          <p className="text-xs text-red-300">{requestState.errors.email[0]}</p>
        ) : null}
      </div>

      {requestState?.message && !requestState.success ? (
        <p
          className="rounded-md border border-red-300/30 bg-red-400/10 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          {requestState.message}
        </p>
      ) : null}

      <Button type="submit" className={darkPrimaryButton} disabled={requestPending}>
        {requestPending ? "Sending code..." : "Send verification code"}
      </Button>
    </form>
  );
}
