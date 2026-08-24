import type { Weekday } from "@/lib/settings/options";

export type ClientAvailability = {
  timezone: string;
  hoursStart: string;
  hoursEnd: string;
  daysAvailable: Weekday[];
};

export const DEFAULT_CLIENT_AVAILABILITY: ClientAvailability = {
  timezone: "Africa/Accra",
  hoursStart: "09:00",
  hoursEnd: "17:00",
  daysAvailable: ["mon", "tue", "wed", "thu", "fri"],
};
