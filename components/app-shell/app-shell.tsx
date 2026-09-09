import { AppShellLayout } from "@/components/app-shell/app-shell-layout";
import { getAlertFeed } from "@/lib/demo/repositories";
import type { AdvisorSession } from "@/lib/dal";

type AppShellProps = {
  session: AdvisorSession;
  children: React.ReactNode;
};

export async function AppShell({ session, children }: AppShellProps) {
  const alerts = await getAlertFeed();

  return (
    <AppShellLayout session={session} alerts={alerts}>
      {children}
    </AppShellLayout>
  );
}
