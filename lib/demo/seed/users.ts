import type { DemoRole } from "@/lib/auth/capabilities";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  demoRole: DemoRole;
  title: string;
  /** Team Lead this user reports to, for the team-scoped book. */
  teamLeadId: string | null;
  joinedDaysAgo: number;
};

/**
 * Staff directory for the demo. Every role in the privilege matrix has a real
 * person behind it so the role switcher lands on populated screens.
 */
export const DEMO_USERS: DemoUser[] = [
  {
    id: "rm-akua",
    name: "Akua Boateng",
    email: "akua.boateng@celerey.app",
    demoRole: "relationship_manager",
    title: "Senior Relationship Manager",
    teamLeadId: "tl-nana",
    joinedDaysAgo: 1420,
  },
  {
    id: "rm-daniel",
    name: "Daniel Mensah",
    email: "daniel.mensah@celerey.app",
    demoRole: "relationship_manager",
    title: "Relationship Manager",
    teamLeadId: "tl-nana",
    joinedDaysAgo: 720,
  },
  {
    id: "po-selorm",
    name: "Selorm Agyeman",
    email: "selorm.agyeman@celerey.app",
    demoRole: "portfolio_officer",
    title: "Portfolio Officer",
    teamLeadId: "tl-nana",
    joinedDaysAgo: 980,
  },
  {
    id: "tl-nana",
    name: "Nana Owusu",
    email: "nana.owusu@celerey.app",
    demoRole: "team_lead",
    title: "Team Lead, Private Clients",
    teamLeadId: null,
    joinedDaysAgo: 2100,
  },
  {
    id: "cmp-esi",
    name: "Esi Appiah",
    email: "esi.appiah@celerey.app",
    demoRole: "compliance",
    title: "Head of Compliance",
    teamLeadId: null,
    joinedDaysAgo: 1860,
  },
  {
    id: "mgt-kwame",
    name: "Kwame Asante",
    email: "kwame.asante@celerey.app",
    demoRole: "management",
    title: "Managing Director, Wealth",
    teamLeadId: null,
    joinedDaysAgo: 2600,
  },
];

export function demoUserById(id: string): DemoUser | undefined {
  return DEMO_USERS.find((user) => user.id === id);
}

export function demoUserByRole(role: DemoRole): DemoUser {
  const match = DEMO_USERS.find((user) => user.demoRole === role);

  if (!match) {
    throw new Error(`No demo user seeded for role ${role}`);
  }

  return match;
}

/** RMs and Portfolio Officers who can hold a book of clients. */
export const BOOK_HOLDER_IDS = DEMO_USERS.filter(
  (user) =>
    user.demoRole === "relationship_manager" || user.demoRole === "team_lead",
).map((user) => user.id);
