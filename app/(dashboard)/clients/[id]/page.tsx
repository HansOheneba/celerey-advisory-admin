import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientDetailView } from "@/components/clients/detail/client-detail-view";
import { mergeAssignableAdvisors } from "@/lib/advisors/assignable";
import { findAppointmentsApi, getAdvisoryEntitlementApi } from "@/lib/api/appointments";
import { getClientAvailabilityApi } from "@/lib/api/availability";
import { findDocumentsApi } from "@/lib/api/documents";
import { DEFAULT_CLIENT_AVAILABILITY } from "@/lib/availability/types";
import { isAdmin } from "@/lib/auth/roles";
import { requireSession } from "@/lib/dal";
import { listAdvisors } from "@/lib/repositories/advisors";
import {
  getClientById,
  getClientDetail,
} from "@/lib/repositories/clients";

type ClientDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ClientDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    return { title: "Client" };
  }

  return {
    title: `${client.firstName} ${client.lastName}`,
  };
}

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const session = await requireSession();
  const admin = isAdmin(session.role);
  const { id } = await params;

  const [
    client,
    detail,
    advisorsResult,
    appointmentsResult,
    availabilityResult,
    documentsResult,
    entitlementResult,
  ] =
    await Promise.all([
      getClientById(id),
      getClientDetail(id),
      admin
        ? listAdvisors({ page: 1, pageSize: 100 }).catch(() => ({
            items: [],
            total: 0,
            page: 1,
            pageSize: 100,
            pageCount: 1,
          }))
        : Promise.resolve({
            items: [],
            total: 0,
            page: 1,
            pageSize: 100,
            pageCount: 1,
          }),
      findAppointmentsApi(session.accessToken, {
        clientId: id,
        status: "all",
      }),
      getClientAvailabilityApi(session.accessToken, id),
      findDocumentsApi(session.accessToken, { clientId: id }),
      getAdvisoryEntitlementApi(session.accessToken, { clientId: id }),
    ]);

  if (!client || !detail) {
    notFound();
  }

  return (
    <ClientDetailView
      client={client}
      detail={detail}
      canViewAnalysis={admin}
      canManageSubscriptions={admin}
      advisors={mergeAssignableAdvisors(advisorsResult.items, session)}
      appointments={
        appointmentsResult.ok ? appointmentsResult.data.items : []
      }
      availability={
        availabilityResult.ok
          ? availabilityResult.data
          : DEFAULT_CLIENT_AVAILABILITY
      }
      documents={documentsResult.ok ? documentsResult.data.items : []}
      entitlement={entitlementResult.ok ? entitlementResult.data : null}
      canEditAvailability={client.advisorId === session.userId}
    />
  );
}
