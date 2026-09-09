import type { Metadata } from "next";

import { DirectClientForm } from "@/components/clients/create/direct-client-form";
import { CreatePageShell } from "@/components/clients/create/create-page-shell";
import { requireClientCreateAccess } from "@/lib/clients/create-page-data";

export const metadata: Metadata = {
  title: "Create client",
};

export default async function DirectClientPage() {
  const { canManageSubscriptions, advisors } = await requireClientCreateAccess();

  return (
    <CreatePageShell
      title="Create for them"
      description="Complete profile, plan, assets, debt, and access in five steps."
    >
      <DirectClientForm
        canManageSubscriptions={canManageSubscriptions}
        advisors={advisors}
      />
    </CreatePageShell>
  );
}
