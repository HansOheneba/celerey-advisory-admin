export type InviteRole = "advisor" | "admin";
export type ActingRole = "advisor" | "admin";
export type StaffRole = "advisor" | "admin" | "super_admin";
export type IdentityRole = "client" | StaffRole;
export type AppRole = StaffRole;
export type RoleScope = "firm_wide" | "own_book";

export type SessionRoleContext = {
  activeRole: ActingRole | null;
  availableRoles: StaffRole[];
  trueRoles: StaffRole[];
  isSuperAdmin: boolean;
  scope: RoleScope;
};

const STAFF_ROLES: StaffRole[] = ["advisor", "admin", "super_admin"];
export const IDENTITY_ROLES: IdentityRole[] = [
  "client",
  "advisor",
  "admin",
  "super_admin",
];

export function isStaffRole(value: string | null | undefined): value is StaffRole {
  return value === "advisor" || value === "admin" || value === "super_admin";
}

export function isIdentityRole(
  value: string | null | undefined,
): value is IdentityRole {
  return (
    value === "client" ||
    value === "advisor" ||
    value === "admin" ||
    value === "super_admin"
  );
}

function canonicalizeIdentityRole(value: string): IdentityRole | null {
  if (value === "client" || value === "user") {
    return "client";
  }

  if (isIdentityRole(value)) {
    return value;
  }

  return null;
}

export function normalizeRole(role?: string | null): AppRole {
  if (role === "super_admin") {
    return "super_admin";
  }

  if (role === "admin") {
    return "admin";
  }

  return "advisor";
}

export function isAdmin(role: AppRole) {
  return role === "admin" || role === "super_admin";
}

export function isSuperAdmin(role: AppRole) {
  return role === "super_admin";
}

export function roleLabel(role: AppRole) {
  if (role === "super_admin") {
    return "Super admin";
  }

  if (role === "admin") {
    return "Admin";
  }

  return "Advisor";
}

export function identityRoleLabel(role: IdentityRole) {
  if (role === "client") {
    return "Client";
  }

  return roleLabel(role);
}

export function parseIdentityRoles(value: unknown): IdentityRole[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<IdentityRole>();

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const role = canonicalizeIdentityRole(item);
    if (role) {
      seen.add(role);
    }
  }

  return IDENTITY_ROLES.filter((role) => seen.has(role));
}

export function rolesFromPrimary(role: AppRole): IdentityRole[] {
  if (role === "super_admin") {
    return ["advisor", "admin", "super_admin"];
  }

  if (role === "admin") {
    return ["admin"];
  }

  return ["advisor"];
}

export function primaryStaffRole(roles: IdentityRole[]): AppRole {
  if (roles.includes("super_admin")) {
    return "super_admin";
  }

  if (roles.includes("admin")) {
    return "admin";
  }

  return "advisor";
}

export function resolveIdentityRoles(input: {
  roles?: unknown;
  trueRoles?: unknown;
  true_roles?: unknown;
  role?: string | null;
  isClient?: boolean;
  is_client?: boolean;
}): IdentityRole[] {
  const fromSet = parseIdentityRoles(
    input.trueRoles ?? input.true_roles ?? input.roles,
  );
  const seeded =
    fromSet.length > 0
      ? fromSet
      : isStaffRole(input.role)
        ? rolesFromPrimary(normalizeRole(input.role))
        : [];
  const hasClient =
    input.isClient === true ||
    input.is_client === true ||
    fromSet.includes("client");

  if (hasClient && !seeded.includes("client")) {
    return parseIdentityRoles(["client", ...seeded]);
  }

  return seeded.length > 0 ? seeded : ["advisor"];
}

export function effectiveRole(context: SessionRoleContext): AppRole {
  if (context.activeRole) {
    return context.activeRole;
  }

  if (context.isSuperAdmin || context.trueRoles.includes("super_admin")) {
    return "super_admin";
  }

  if (context.trueRoles.includes("admin")) {
    return "admin";
  }

  return "advisor";
}

export function sessionRoleFields(context: SessionRoleContext) {
  const role = effectiveRole(context);

  return {
    role,
    trueRoles: context.trueRoles.length > 0 ? context.trueRoles : [role],
    activeRole: context.activeRole,
    isSuperAdmin: context.isSuperAdmin,
    availableRoles:
      context.availableRoles.length > 0 ? context.availableRoles : [role],
    scope: context.scope,
  };
}

export function contextFromRole(role: string | null | undefined): SessionRoleContext {
  const normalized = normalizeRole(role);
  const isSuper = normalized === "super_admin";

  return {
    activeRole: null,
    availableRoles: isSuper ? ["advisor", "admin"] : [normalized],
    trueRoles: isSuper ? ["super_admin", "admin", "advisor"] : [normalized],
    isSuperAdmin: isSuper,
    scope: isAdmin(normalized) ? "firm_wide" : "own_book",
  };
}

export function parseSessionRoleContext(
  data: unknown,
  fallbackRole?: string | null,
): SessionRoleContext {
  const fallback = contextFromRole(fallbackRole);

  if (!data || typeof data !== "object") {
    return fallback;
  }

  const record = data as Record<string, unknown>;
  const activeRaw = record.activeRole ?? record.active_role;
  const activeRole: ActingRole | null =
    activeRaw === "advisor" || activeRaw === "admin" ? activeRaw : null;

  const trueRoles = parseStaffRoles(record.trueRoles ?? record.true_roles);
  const availableRoles = parseStaffRoles(
    record.availableRoles ?? record.available_roles,
  );
  const isSuperAdmin =
    record.isSuperAdmin === true ||
    record.is_super_admin === true ||
    trueRoles.includes("super_admin") ||
    fallback.isSuperAdmin;
  const scope: RoleScope =
    record.scope === "own_book" || record.scope === "firm_wide"
      ? record.scope
      : fallback.scope;

  if (trueRoles.length === 0 && availableRoles.length === 0 && !isSuperAdmin) {
    return {
      ...fallback,
      activeRole: activeRole ?? fallback.activeRole,
      scope,
    };
  }

  return {
    activeRole,
    availableRoles:
      availableRoles.length > 0
        ? availableRoles
        : isSuperAdmin
          ? ["advisor", "admin"]
          : trueRoles.length > 0
            ? trueRoles
            : fallback.availableRoles,
    trueRoles:
      trueRoles.length > 0
        ? trueRoles
        : isSuperAdmin
          ? ["super_admin", "admin", "advisor"]
          : fallback.trueRoles,
    isSuperAdmin,
    scope,
  };
}

export function withActingRole(
  context: SessionRoleContext,
  actingRole: ActingRole | null,
): SessionRoleContext {
  return {
    ...context,
    activeRole: actingRole,
    scope: actingRole === "advisor" ? "own_book" : "firm_wide",
  };
}

export function actingRoleForLogin(role: StaffRole): ActingRole | null {
  if (role === "super_admin") {
    return null;
  }

  return role;
}

export function canSwitchActingRole(input: {
  isSuperAdmin: boolean;
  trueRoles: StaffRole[];
  availableRoles: StaffRole[];
}) {
  if (input.isSuperAdmin) {
    return true;
  }

  const switchable = new Set(
    [...input.trueRoles, ...input.availableRoles].filter(
      (role) => role === "advisor" || role === "admin",
    ),
  );

  return switchable.size > 1;
}

export function holdsLoginRole(
  selected: StaffRole,
  context: SessionRoleContext,
) {
  if (context.isSuperAdmin || context.trueRoles.includes("super_admin")) {
    return true;
  }

  if (selected === "super_admin") {
    return false;
  }

  return (
    context.trueRoles.includes(selected) ||
    context.availableRoles.includes(selected) ||
    effectiveRole(context) === selected
  );
}

function parseStaffRoles(value: unknown): StaffRole[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((role): role is StaffRole =>
    typeof role === "string" && STAFF_ROLES.includes(role as StaffRole),
  );
}
