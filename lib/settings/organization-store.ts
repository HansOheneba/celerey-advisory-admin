export type OrganizationIntegrations = {
  calendarSync: boolean;
  emailDelivery: boolean;
  slackAlerts: boolean;
};

export type OrganizationSettings = {
  name: string;
  website: string;
  supportEmail: string;
  logoDataUrl: string | null;
  integrations: OrganizationIntegrations;
};

const STORAGE_KEY = "celerey.org.settings.v1";

export function defaultOrganizationSettings(): OrganizationSettings {
  return {
    name: "Celerey",
    website: "",
    supportEmail: "",
    logoDataUrl: null,
    integrations: {
      calendarSync: false,
      emailDelivery: false,
      slackAlerts: false,
    },
  };
}

export function loadOrganizationSettings(): OrganizationSettings {
  const fallback = defaultOrganizationSettings();

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<OrganizationSettings>;
    return {
      ...fallback,
      ...parsed,
      integrations: {
        ...fallback.integrations,
        ...parsed.integrations,
      },
    };
  } catch {
    return fallback;
  }
}

export function saveOrganizationSettings(settings: OrganizationSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
