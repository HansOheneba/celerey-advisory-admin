import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientDetailView } from "@/components/clients/detail/client-detail-view";
import {
  getClientById,
  getClientDetail,
} from "@/lib/repositories/clients";
import { requireSession } from "@/lib/dal";

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
  await requireSession();
  const { id } = await params;

  const [client, detail] = await Promise.all([
    getClientById(id),
    getClientDetail(id),
  ]);

  if (!client || !detail) {
    notFound();
  }

  return <ClientDetailView client={client} detail={detail} />;
}
