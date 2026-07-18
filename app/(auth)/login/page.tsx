import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { LoginHero } from "@/components/auth/login-hero";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <LoginHero />

      <div className="flex flex-col bg-primary px-6 py-8 sm:px-10">
        <Image
          src="/logos/logoWhite.png"
          alt="Celerey"
          width={120}
          height={30}
          className="h-14 w-auto self-start"
          priority
        />

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                Wealth advisory workspace
              </p>
              <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Sign in to the advisor portal
              </h1>
              <p className="text-sm leading-relaxed text-white/60">
                Use your Celerey work email. We&apos;ll send a one-time code to
                verify your access.
              </p>
            </div>

            <LoginForm />
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
