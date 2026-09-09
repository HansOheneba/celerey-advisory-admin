import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { LoginHero } from "@/components/auth/login-hero";
import { DemoRolePicker } from "@/components/auth/demo-role-picker";
import { DEMO_MODE } from "@/lib/demo/config";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ reason?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const sessionExpired = params.reason === "session_expired";

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <LoginHero />

      <div className="flex flex-col bg-primary px-6 py-8 sm:px-10">
        <Image
          src="/logos/logoWhite.png"
          alt="Celerey"
          width={120}
          height={30}
          className="h-10 w-auto self-start"
          priority
        />

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="celerey-enter w-full max-w-sm space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/50">
                Wealth advisory workspace
              </p>
              <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Sign in to Celerey
              </h1>
              <p className="text-sm leading-relaxed text-white/60">
                {sessionExpired
                  ? "Your session expired. Choose a role and sign in again."
                  : DEMO_MODE
                    ? "Choose the role you want to explore. You can switch at any time from the top bar."
                    : "Choose whether you are an advisor or an admin, then we'll send a one-time code."}
              </p>
            </div>

            {DEMO_MODE ? <DemoRolePicker /> : <LoginForm />}
          </div>
        </div>

        <p className="text-xs text-white/40">
          Celerey internal portal. For authorised advisors and wealth
          advisory staff.
        </p>
      </div>
    </main>
  );
}
