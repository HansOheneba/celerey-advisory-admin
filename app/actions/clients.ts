"use server";

import { revalidatePath } from "next/cache";
import {
  CreateClientFormSchema,
  type CreateClientFormState,
} from "@/lib/definitions";
import { requireSession } from "@/lib/dal";
import { createClient } from "@/lib/repositories/clients";

export async function createClientAction(
  _state: CreateClientFormState,
  formData: FormData,
): Promise<CreateClientFormState> {
  const session = await requireSession();

  const validatedFields = CreateClientFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const result = await createClient({
    ...validatedFields.data,
    advisorId: session.userId,
    advisorName: session.name,
  });

  if ("error" in result) {
    return {
      errors: { email: [result.error] },
      message: result.error,
    };
  }

  revalidatePath("/clients");
  revalidatePath("/dashboard");

  return { success: true };
}
