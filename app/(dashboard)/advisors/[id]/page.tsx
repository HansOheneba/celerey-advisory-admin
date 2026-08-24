import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdvisorProfileView } from "@/components/advisors/advisor-profile-view";
import { requireSession } from "@/lib/dal";
import {
  getAdvisorById,
  listClientsForAdvisor,
} from "@/lib/repositories/advisors";

type AdvisorDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: AdvisorDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const advisor = await getAdvisorById(id);

  if (!advisor) {
    return { title: "Advisor" };
  }

  return { title: advisor.name };
}

export default async function AdvisorDetailPage({
  params,
}: AdvisorDetailPageProps) {
  const session = await requireSession();
  const { id } = await params;

  const [advisor, clientsResult] = await Promise.all([
    getAdvisorById(id),
    listClientsForAdvisor(id, { page: 1, pageSize: 100 }),
  ]);

  if (!advisor) {
    notFound();
  }

  return (
    <AdvisorProfileView
      advisor={advisor}
      clients={clientsResult.items}
      totalClients={clientsResult.total}
      canManageRoles={session.isSuperAdmin}
      isSelf={advisor.id === session.userId}
    />
  );
}
