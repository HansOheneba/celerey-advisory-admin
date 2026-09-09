import type { Metadata } from "next";

import { InviteClientForm } from "@/components/clients/create/invite-client-form";
import { CreatePageShell } from "@/components/clients/create/create-page-shell";
import { requireClientCreateAccess } from "@/lib/clients/create-page-data";

export const metadata: Metadata = {
  title: "Invite client",
};

export default async function InviteClientPage() {
  const { canManageSubscriptions, advisors } = await requireClientCreateAccess();

  return (
    <CreatePageShell
      title="Send invite"
      description="Create the client record and email an onboarding invite. They will complete identity and financial setup in the client app."
    >
      <InviteClientForm
        canManageSubscriptions={canManageSubscriptions}
        advisors={advisors}
      />
    </CreatePageShell>
  );
}
