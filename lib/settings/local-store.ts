import type { Weekday } from "@/lib/settings/options";

export type AdvisorNotificationPreferences = {
  clientAssigned: boolean;
  clientMessage: boolean;
  appointmentReminder: boolean;
  taskReminder: boolean;
  documentUploaded: boolean;
  goalUpdate: boolean;
};

export type AdvisorSettings = {
  displayName: string;
  title: string;
  phone: string;
  bio: string;
  avatarDataUrl: string | null;
  country: string;
  timezone: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  daysAvailable: Weekday[];
  appointmentDurationMinutes: number;
  appointmentBufferMinutes: number;
  notifications: AdvisorNotificationPreferences;
};

const STORAGE_KEY = "fidelity.advisor.settings.v3";
const LEGACY_STORAGE_KEY = "celerey.advisor.settings.v3";
const LEGACY_STORAGE_KEY_V2 = "celerey.advisor.settings.v2";

export function defaultAdvisorSettings(displayName: string): AdvisorSettings {
  return {
    displayName,
    title: "Wealth Advisor",
    phone: "",
    bio: "",
    avatarDataUrl: null,
    country: "GH",
    timezone: "Africa/Accra",
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
    daysAvailable: ["mon", "tue", "wed", "thu", "fri"],
    appointmentDurationMinutes: 30,
    appointmentBufferMinutes: 10,
    notifications: {
      clientAssigned: true,
      clientMessage: true,
      appointmentReminder: true,
      taskReminder: true,
      documentUploaded: true,
      goalUpdate: true,
    },
  };
}

type LegacyAdvisorSettings = {
  displayName?: string;
  title?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  notifyReviews?: boolean;
  notifyMessages?: boolean;
  notifyOnboarding?: boolean;
};

function migrateLegacySettings(
  legacy: LegacyAdvisorSettings,
  fallback: AdvisorSettings,
): AdvisorSettings {
  return {
    ...fallback,
    displayName: legacy.displayName?.trim() || fallback.displayName,
    title: legacy.title ?? fallback.title,
    phone: legacy.phone ?? fallback.phone,
    country: legacy.country ?? fallback.country,
    timezone: legacy.timezone ?? fallback.timezone,
    workingHoursStart: legacy.workingHoursStart ?? fallback.workingHoursStart,
    workingHoursEnd: legacy.workingHoursEnd ?? fallback.workingHoursEnd,
    notifications: {
      ...fallback.notifications,
      clientMessage: legacy.notifyMessages ?? fallback.notifications.clientMessage,
    },
  };
}

export function loadAdvisorSettings(displayName: string): AdvisorSettings {
  const fallback = defaultAdvisorSettings(displayName);

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdvisorSettings>;
      return {
        ...fallback,
        ...parsed,
        displayName: parsed.displayName?.trim() || displayName,
        notifications: {
          ...fallback.notifications,
          ...parsed.notifications,
        },
      };
    }

    const legacyV3 = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyV3) {
      const parsed = JSON.parse(legacyV3) as Partial<AdvisorSettings>;
      const migrated = {
        ...fallback,
        ...parsed,
        displayName: parsed.displayName?.trim() || displayName,
        notifications: {
          ...fallback.notifications,
          ...parsed.notifications,
        },
      };
      saveAdvisorSettings(migrated);
      return migrated;
    }

    const legacyV2 = window.localStorage.getItem(LEGACY_STORAGE_KEY_V2);
    if (legacyV2) {
      const migrated = migrateLegacySettings(
        JSON.parse(legacyV2) as LegacyAdvisorSettings,
        fallback,
      );
      saveAdvisorSettings(migrated);
      return migrated;
    }

    return fallback;
  } catch {
    return fallback;
  }
}

export function saveAdvisorSettings(settings: AdvisorSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
