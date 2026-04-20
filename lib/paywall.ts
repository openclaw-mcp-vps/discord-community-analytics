export const ACCESS_COOKIE_NAME = "dca_access_servers";

export function decodeServerAccessCookie(cookieValue?: string | null): string[] {
  if (!cookieValue) {
    return [];
  }

  try {
    const decoded = Buffer.from(cookieValue, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export function encodeServerAccessCookie(serverIds: string[]): string {
  const unique = [...new Set(serverIds)].filter((entry) => entry.trim().length > 0);
  return Buffer.from(JSON.stringify(unique), "utf8").toString("base64url");
}

export function hasServerAccess(cookieValue: string | null | undefined, serverId: string): boolean {
  return decodeServerAccessCookie(cookieValue).includes(serverId);
}

export function withServerAccess(cookieValue: string | null | undefined, serverId: string): string {
  const existing = decodeServerAccessCookie(cookieValue);
  existing.push(serverId);
  return encodeServerAccessCookie(existing);
}
