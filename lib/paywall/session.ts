import crypto from "crypto";

interface PaywallSessionPayload {
  orderId: string;
  email: string;
  serverId: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(input: string) {
  return Buffer.from(input, "utf-8")
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = 4 - (normalized.length % 4 || 4);
  const padded = normalized + "=".repeat(padding === 4 ? 0 : padding);
  return Buffer.from(padded, "base64").toString("utf-8");
}

function sign(value: string, secret: string) {
  return crypto
    .createHmac("sha256", secret)
    .update(value)
    .digest("base64url");
}

export function createPaywallToken(
  data: Omit<PaywallSessionPayload, "iat" | "exp">,
  secret: string,
  validityDays = 35
) {
  const now = Math.floor(Date.now() / 1000);
  const payload: PaywallSessionPayload = {
    ...data,
    iat: now,
    exp: now + validityDays * 24 * 60 * 60
  };

  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encoded, secret);
  return `${encoded}.${signature}`;
}

export function verifyPaywallToken(
  token: string | undefined,
  secret: string,
  expectedServerId?: string
) {
  if (!token) {
    return null;
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = sign(encoded, secret);
  const signaturesMatch = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!signaturesMatch) {
    return null;
  }

  let parsed: PaywallSessionPayload;
  try {
    parsed = JSON.parse(base64UrlDecode(encoded)) as PaywallSessionPayload;
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (parsed.exp < now) {
    return null;
  }

  if (expectedServerId && parsed.serverId !== expectedServerId) {
    return null;
  }

  return parsed;
}
