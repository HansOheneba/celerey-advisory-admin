"use server";

import { revalidatePath } from "next/cache";
import { bulkAssignClientsApi } from "@/lib/api/assignments";
import {
  BulkAssignSchema,
  type BulkAssignFormState,
} from "@/lib/definitions";
import { requireAdmin } from "@/lib/dal";
import { assignClientAdvisor } from "@/lib/repositories/clients";

export async function bulkAssignClientsAction(
  _state: BulkAssignFormState,
  formData: FormData,
): Promise<BulkAssignFormState> {
  const session = await requireAdmin();

  const validatedFields = BulkAssignSchema.safeParse({
    clientIds: formData.getAll("clientIds").map(String),
    advisorId: formData.get("advisorId"),
  });

  if (!validatedFields.success) {
    return {
      message:
        validatedFields.error.flatten().fieldErrors.clientIds?.[0] ??
        validatedFields.error.flatten().fieldErrors.advisorId?.[0] ??
        "Select an advisor and at least one client.",
    };
  }

  const { clientIds, advisorId } = validatedFields.data;

  const bulkResult = await bulkAssignClientsApi(session.accessToken, {
    clientIds,
    advisorId,
  });

  if (bulkResult.ok) {
    const assignedCount =
      bulkResult.data.assignedCount ??
      bulkResult.data.assigned_count ??
      clientIds.length;
    const failedIds =
      bulkResult.data.failedClientIds ??
      bulkResult.data.failed_client_ids ??
      [];

    revalidatePath("/assignments");
    revalidatePath("/clients");
    revalidatePath("/advisors");
    revalidatePath("/dashboard");

    if (failedIds.length > 0) {
      return {
        message: `Assigned ${assignedCount} of ${clientIds.length} clients. ${failedIds.length} failed — try again.`,
      };
    }

    return {
      success: true,
      message: `Assigned ${assignedCount} client${assignedCount === 1 ? "" : "s"}.`,
    };
  }

  // Fallback: loop single-assign if bulk usecase isn't available yet.
  const results = await Promise.all(
    clientIds.map((clientId) => assignClientAdvisor(clientId, advisorId)),
  );
  const failedCount = results.filter((result) => !result.ok).length;

  revalidatePath("/assignments");
  revalidatePath("/clients");
  revalidatePath("/advisors");
  revalidatePath("/dashboard");

  if (failedCount > 0) {
    return {
      message: `Assigned ${clientIds.length - failedCount} of ${clientIds.length} clients. ${failedCount} failed — try again.`,
    };
  }

  return {
    success: true,
    message: `Assigned ${clientIds.length} client${clientIds.length === 1 ? "" : "s"}.`,
  };
}
