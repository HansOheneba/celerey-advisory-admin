"use server";

import { revalidatePath } from "next/cache";
import {
  CreateAdvisorFormSchema,
  type CreateAdvisorFormState,
} from "@/lib/definitions";
import { createAdvisor, updateStaffRoles } from "@/lib/repositories/advisors";
import type { IdentityRole } from "@/lib/auth/roles";

export async function createAdvisorAction(
  _state: CreateAdvisorFormState,
  formData: FormData,
): Promise<CreateAdvisorFormState> {
  const validatedFields = CreateAdvisorFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role") || "advisor",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const { name, email, role } = validatedFields.data;
  const result = await createAdvisor({ name, email, role });

  if (!result.ok) {
    const emailError =
      result.status === 409
        ? "An advisor with this email already exists."
        : result.message;

    return {
      errors: { email: [emailError] },
      message: result.message,
    };
  }

  revalidatePath("/advisors");
  revalidatePath("/clients");
  revalidatePath("/settings");

  return { success: true };
}

export async function updateStaffRolesAction(input: {
  staffId: string;
  roles: IdentityRole[];
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await updateStaffRoles(input.staffId, input.roles);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidatePath("/advisors");
  revalidatePath("/settings");
  revalidatePath(`/advisors/${input.staffId}`);

  return { ok: true };
}
