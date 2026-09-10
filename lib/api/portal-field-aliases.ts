import "server-only";

/**
 * Reads the first non-empty string from a row using admin and client-portal
 * field names. Keeps admin UI types stable while the backend adopts client.* naming.
 */
export function pickString(
  row: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return "";
}

export function pickNullableString(
  row: Record<string, unknown>,
  ...keys: string[]
): string | null {
  const value = pickString(row, ...keys);
  return value || null;
}

export function pickParty(
  row: Record<string, unknown>,
  ...keys: string[]
): "advisor" | "client" | undefined {
  const value = pickString(row, ...keys);
  if (value === "client") {
    return "client";
  }
  if (value === "advisor") {
    return "advisor";
  }
  return undefined;
}
