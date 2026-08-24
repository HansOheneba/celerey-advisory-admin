"use server";

import { revalidatePath } from "next/cache";
import {
  getAvailabilitySettingsApi,
  getNotificationSettingsApi,
  getProfileSettingsApi,
  mergeAdvisorSettings,
  updateAvailabilitySettingsApi,
  updateNotificationSettingsApi,
  updateProfileSettingsApi,
  uploadAvatarApi,
} from "@/lib/api/settings";
import { requireSession } from "@/lib/dal";
import type { AdvisorSettings } from "@/lib/settings/local-store";

export async function loadAdvisorSettingsAction(): Promise<AdvisorSettings> {
  const session = await requireSession();
  const [profile, notifications, availability] = await Promise.all([
    getProfileSettingsApi(session.accessToken),
    getNotificationSettingsApi(session.accessToken),
    getAvailabilitySettingsApi(session.accessToken),
  ]);

  return mergeAdvisorSettings(
    session.name,
    profile.ok ? profile.data : null,
    notifications.ok ? notifications.data : null,
    availability.ok ? availability.data : null,
  );
}

export async function saveAdvisorSettingsAction(
  settings: AdvisorSettings,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await requireSession();

  const [profileResult, notificationsResult, availabilityResult] =
    await Promise.all([
      updateProfileSettingsApi(session.accessToken, {
        displayName: settings.displayName,
        title: settings.title,
        phone: settings.phone,
        bio: settings.bio,
        country: settings.country,
        timezone: settings.timezone,
      }),
      updateNotificationSettingsApi(
        session.accessToken,
        settings.notifications,
      ),
      updateAvailabilitySettingsApi(session.accessToken, {
        workingHoursStart: settings.workingHoursStart,
        workingHoursEnd: settings.workingHoursEnd,
        daysAvailable: settings.daysAvailable,
        appointmentDurationMinutes: settings.appointmentDurationMinutes,
        appointmentBufferMinutes: settings.appointmentBufferMinutes,
      }),
    ]);

  if (!profileResult.ok) {
    return { ok: false, message: profileResult.message };
  }
  if (!notificationsResult.ok) {
    return { ok: false, message: notificationsResult.message };
  }
  if (!availabilityResult.ok) {
    return { ok: false, message: availabilityResult.message };
  }

  revalidatePath("/settings");

  return { ok: true };
}

export async function uploadAvatarAction(
  formData: FormData,
): Promise<
  { ok: true; avatarUrl: string } | { ok: false; message: string }
> {
  const session = await requireSession();
  const file = formData.get("file");

  if (!(file instanceof Blob) || file.size === 0) {
    return { ok: false, message: "Choose an image to upload." };
  }

  const result = await uploadAvatarApi(session.accessToken, file);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  const avatarUrl =
    result.data.avatarUrl ?? result.data.avatar_url ?? "";

  if (!avatarUrl) {
    return { ok: false, message: "Upload succeeded but no avatar URL returned." };
  }

  revalidatePath("/settings");

  return { ok: true, avatarUrl };
}
