import type { Metadata } from "next";
import { MessagesWorkspace } from "@/components/messages/messages-workspace";
import { findMessageThreadsApi } from "@/lib/api/messages";
import { requireSession } from "@/lib/dal";
import { listClients } from "@/lib/repositories/clients";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function MessagesPage() {
  const session = await requireSession();
  const [clientsResult, threadsResult] = await Promise.all([
    listClients({
      page: 1,
      pageSize: 100,
      sortBy: "lastContactAt",
      sortDir: "desc",
      ownBookOnly: true,
    }),
    findMessageThreadsApi(session.accessToken, { page: 1, pageSize: 50 }),
  ]);

  return (
    <MessagesWorkspace
      clients={clientsResult.items}
      initialThreads={threadsResult.ok ? threadsResult.data.items : []}
    />
  );
}
