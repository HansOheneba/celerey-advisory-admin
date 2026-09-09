/**
 * Implements the privilege matrix from the RM interface spec: six roles across
 * four tiers, each with a defined set of things they can see, do, and reach.
 *
 * Capabilities are the only thing UI should branch on. Never branch on the raw
 * role — that is what made analysis admin-only and locked RMs out of their own
 * client 360.
 */

export type DemoRole =
  | "relationship_manager"
  | "portfolio_officer"
  | "team_lead"
  | "compliance"
  | "management";

export type RoleTier = "operational" | "governance" | "control";

/** How much of the book a role can see. */
export type BookScope = "own_book" | "team" | "firm";

export type MenuKey =
  | "overview"
  | "clients"
  | "copilot"
  | "insights"
  | "products"
  | "tools";

export type Capability =
  /** Full client 360 across every workspace tab. */
  | "view_client_360"
  /** Portfolio, allocation and performance only — no full relationship view. */
  | "view_client_portfolio"
  /** Capture and maintain portal-side profile data on the client's behalf. */
  | "edit_client_data"
  | "create_client"
  | "assign_advisor"
  | "message_client"
  | "manage_documents"
  | "propose_recommendation"
  | "approve_recommendation"
  | "execute_trade"
  | "generate_report"
  | "use_copilot"
  | "manage_advisors"
  | "configure_permissions"
  | "view_audit"
  | "manage_compliance"
  | "view_firm_analytics";

type RoleDefinition = {
  label: string;
  tier: RoleTier;
  scope: BookScope;
  /** One-line description of the role's job, shown in the role switcher. */
  mission: string;
  menus: MenuKey[];
  capabilities: Capability[];
};

const ROLE_DEFINITIONS: Record<DemoRole, RoleDefinition> = {
  relationship_manager: {
    label: "Relationship Manager",
    tier: "operational",
    scope: "own_book",
    mission: "Owns the client relationship — understand, advise, engage, grow.",
    menus: ["overview", "clients", "copilot", "insights", "products", "tools"],
    capabilities: [
      "view_client_360",
      "view_client_portfolio",
      "edit_client_data",
      "create_client",
      "message_client",
      "manage_documents",
      "propose_recommendation",
      "generate_report",
      "use_copilot",
    ],
  },
  portfolio_officer: {
    label: "Portfolio Officer",
    tier: "operational",
    scope: "firm",
    mission:
      "Portfolio analysis, monitoring, recommendations, rebalancing and execution.",
    menus: ["overview", "clients", "copilot", "insights", "products", "tools"],
    capabilities: [
      "view_client_portfolio",
      "propose_recommendation",
      "execute_trade",
      "generate_report",
      "use_copilot",
      "view_firm_analytics",
    ],
  },
  team_lead: {
    label: "Team Lead",
    tier: "governance",
    scope: "team",
    mission: "Supervises a team of RMs, approves recommendations, owns the team book.",
    menus: ["overview", "clients", "copilot", "insights", "products", "tools"],
    capabilities: [
      "view_client_360",
      "view_client_portfolio",
      "edit_client_data",
      "create_client",
      "assign_advisor",
      "message_client",
      "manage_documents",
      "propose_recommendation",
      "approve_recommendation",
      "generate_report",
      "use_copilot",
      "manage_advisors",
      "view_audit",
      "view_firm_analytics",
    ],
  },
  compliance: {
    label: "Compliance",
    tier: "control",
    scope: "firm",
    mission:
      "Suitability, KYC/AML, disclosures and audit — gates every recommendation.",
    menus: ["overview", "clients", "copilot", "insights"],
    capabilities: [
      "view_client_360",
      "view_client_portfolio",
      "approve_recommendation",
      "manage_compliance",
      "view_audit",
      "generate_report",
      "use_copilot",
      "view_firm_analytics",
    ],
  },
  management: {
    label: "Management",
    tier: "governance",
    scope: "firm",
    mission:
      "Oversight of AUA, revenue, risk and relationships; configuration and permissions.",
    menus: ["overview", "clients", "copilot", "insights", "products", "tools"],
    capabilities: [
      "view_client_360",
      "view_client_portfolio",
      "edit_client_data",
      "create_client",
      "assign_advisor",
      "message_client",
      "manage_documents",
      "generate_report",
      "use_copilot",
      "manage_advisors",
      "configure_permissions",
      "view_audit",
      "view_firm_analytics",
    ],
  },
};

export const DEMO_ROLES = Object.keys(ROLE_DEFINITIONS) as DemoRole[];

export function isDemoRole(value: string | null | undefined): value is DemoRole {
  return typeof value === "string" && value in ROLE_DEFINITIONS;
}

export function roleDefinition(role: DemoRole): RoleDefinition {
  return ROLE_DEFINITIONS[role];
}

export function demoRoleLabel(role: DemoRole): string {
  return ROLE_DEFINITIONS[role].label;
}

export function bookScope(role: DemoRole): BookScope {
  return ROLE_DEFINITIONS[role].scope;
}

export function can(role: DemoRole, capability: Capability): boolean {
  return ROLE_DEFINITIONS[role].capabilities.includes(capability);
}

export function canReachMenu(role: DemoRole, menu: MenuKey): boolean {
  return ROLE_DEFINITIONS[role].menus.includes(menu);
}

export function menusFor(role: DemoRole): MenuKey[] {
  return ROLE_DEFINITIONS[role].menus;
}

/**
 * Resolved capability set for a signed-in user, so server components and
 * client components share one shape.
 */
export type CapabilitySet = {
  role: DemoRole;
  label: string;
  tier: RoleTier;
  scope: BookScope;
  mission: string;
  menus: MenuKey[];
  capabilities: Capability[];
};

export function capabilitySet(role: DemoRole): CapabilitySet {
  const definition = ROLE_DEFINITIONS[role];

  return {
    role,
    label: definition.label,
    tier: definition.tier,
    scope: definition.scope,
    mission: definition.mission,
    menus: definition.menus,
    capabilities: definition.capabilities,
  };
}

export function hasCapability(
  set: Pick<CapabilitySet, "capabilities">,
  capability: Capability,
): boolean {
  return set.capabilities.includes(capability);
}
