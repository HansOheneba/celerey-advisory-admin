import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAdvisorOnboardingInviteApi } from "@/lib/api/advisors";
import { LoginHero } from "@/components/auth/login-hero";
import { OnboardingProfileForm } from "@/components/auth/onboarding-profile-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Set up your advisor account",
};

type OnboardingPageProps = {
  searchParams: Promise<{ token?: string }>;
};

function OnboardingShell({ children }: { children: ReactNode }) {
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
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function AdvisorOnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const { token } = await searchParams;
  const inviteToken = token?.trim() ?? "";

  if (!inviteToken) {
    return (
      <OnboardingShell>
        <InviteStatus
          title="This invite link is incomplete"
          body="Ask your admin to send a new invitation, or sign in if you already have an account."
        />
      </OnboardingShell>
    );
  }

  const invite = await getAdvisorOnboardingInviteApi(inviteToken);

  if (!invite.ok) {
    return (
      <OnboardingShell>
        <InviteStatus
          title="This invite link isn't valid"
          body={
            invite.message ||
            "It may have expired or already been used. Ask your admin to send a new invitation."
          }
        />
      </OnboardingShell>
    );
  }

  if (invite.data.alreadyCompleted) {
    return (
      <OnboardingShell>
        <InviteStatus
          title="This account is already set up"
          body="Sign in with your work email to continue."
        />
      </OnboardingShell>
    );
  }

  const defaultName =
    `${invite.data.firstName} ${invite.data.lastName}`.trim() ||
    invite.data.email;

  return (
    <OnboardingShell>
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/50">
          Advisor onboarding
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Set up your advisor account
        </h1>
        <p className="text-sm leading-relaxed text-white/60">
          Add the details your team and clients will see. Signed in as{" "}
          <span className="text-white">{invite.data.email}</span>.
        </p>
      </div>
      <OnboardingProfileForm token={inviteToken} defaultName={defaultName} />
    </OnboardingShell>
  );
}

function InviteStatus({ title, body }: { title: string; body: string }) {
  return (
    <>
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/50">
          Advisor onboarding
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-white/60">{body}</p>
      </div>
      <Link
        href="/login"
        className={cn(
          buttonVariants(),
          "h-11 w-full bg-white text-primary hover:bg-white/90",
        )}
      >
        Go to sign in
      </Link>
    </>
  );
}
