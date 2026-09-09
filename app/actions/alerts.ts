"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/dal";
import { getAlertFeed } from "@/lib/demo/repositories";
import { mutateDemoDb } from "@/lib/demo/store";

export async function markAlertRead(alertId: string) {
  await requireSession();

  await mutateDemoDb((db) => {
    if (!db.readAlertIds.includes(alertId)) {
      db.readAlertIds.push(alertId);
    }
  });

  revalidatePath("/", "layout");
}

export async function markAllAlertsRead() {
  await requireSession();
  const alerts = await getAlertFeed();

  await mutateDemoDb((db) => {
    const known = new Set(db.readAlertIds);

    for (const alert of alerts) {
      if (!known.has(alert.id)) {
        db.readAlertIds.push(alert.id);
      }
    }
  });

  revalidatePath("/", "layout");
}
