import type { Metadata } from "next";
import Image from "next/image";
import { LOGO_WORDMARK_LIGHT } from "@/lib/brand";
import { LoginForm } from "@/components/auth/login-form";
import { LoginHero } from "@/components/auth/login-hero";

export const metadata: Metadata = {
  title: "Operator sign in",
};

type SuperLoginPageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function SuperLoginPage({
  searchParams,
}: SuperLoginPageProps) {
  const params = await searchParams;
  const sessionExpired = params.reason === "session_expired";

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <LoginHero />

      <div className="flex flex-col bg-primary px-6 py-8 sm:px-10">
        <Image
          src={LOGO_WORDMARK_LIGHT}
          alt="Fidelity"
          width={160}
          height={48}
          className="h-10 w-auto self-start"
          priority
        />

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="brand-enter w-full max-w-sm space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/50">
                Operator access
              </p>
              <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Sign in
              </h1>
              <p className="text-sm leading-relaxed text-white/60">
                {sessionExpired
                  ? "Your session expired. Enter your work email to get a new code."
                  : "We'll send a one-time code to your work email."}
              </p>
            </div>

            <LoginForm fixedRole="super_admin" />
          </div>
        </div>

        <p className="text-xs text-white/40">Restricted operator access.</p>
      </div>
    </main>
  );
}
