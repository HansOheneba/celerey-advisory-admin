import type { Metadata } from "next";

import { CopilotView } from "@/components/copilot/copilot-view";
import { requireCapability } from "@/lib/dal";
import { getScopedClientRecords } from "@/lib/demo/repositories";

export const metadata: Metadata = {
  title: "Copilot",
};

const SCOPE_LABELS = {
  own_book: "your own book",
  team: "your team's book",
  firm: "the firm-wide book",
} as const;

export default async function CopilotPage() {
  const session = await requireCapability("use_copilot");
  const records = await getScopedClientRecords();

  return (
    <CopilotView
      scopeLabel={SCOPE_LABELS[session.capabilities.scope]}
      clients={records.map((record) => ({
        id: record.client.id,
        name: `${record.client.firstName} ${record.client.lastName}`,
      }))}
    />
  );
}
