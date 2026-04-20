import { createHmac, timingSafeEqual } from "node:crypto";

import { getPublicEnv, getServerEnv } from "@/lib/env";

const ACCESS_COOKIE_NAME = "dca_access";
const ACCESS_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 35;

interface AccessTokenPayload {
  orderId: string;
  email: string;
  serverId: string;
  exp: number;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSigningSecret() {
  const { LEMON_SQUEEZY_WEBHOOK_SECRET } = getServerEnv();
  if (!LEMON_SQUEEZY_WEBHOOK_SECRET) {
    throw new Error("Missing LEMON_SQUEEZY_WEBHOOK_SECRET");
  }
  return LEMON_SQUEEZY_WEBHOOK_SECRET;
}

function sign(payloadBase64: string) {
  return createHmac("sha256", getSigningSecret()).update(payloadBase64).digest("base64url");
}

export function createAccessToken(orderId: string, email: string, serverId: string) {
  const payload: AccessTokenPayload = {
    orderId,
    email,
    serverId,
    exp: Math.floor(Date.now() / 1000) + ACCESS_COOKIE_TTL_SECONDS,
  };

  const payloadEncoded = toBase64Url(JSON.stringify(payload));
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export function verifyAccessToken(token: string | undefined): AccessTokenPayload | null {
  if (!token) {
    return null;
  }

  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) {
    return null;
  }

  const expectedSignature = sign(payloadEncoded);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadEncoded)) as AccessTokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getAccessCookieName() {
  return ACCESS_COOKIE_NAME;
}

export function getAccessCookieMaxAgeSeconds() {
  return ACCESS_COOKIE_TTL_SECONDS;
}

export function verifyLemonWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature) {
    return false;
  }
  const secret = getServerEnv().LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return false;
  }
  const digest = createHmac("sha256", secret).update(body).digest("hex");
  const actual = Buffer.from(signature);
  const expected = Buffer.from(digest);
  if (actual.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(actual, expected);
}

export function buildCheckoutUrl(serverId: string, email: string): string | null {
  const { NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID } = getPublicEnv();
  if (!NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID) {
    return null;
  }

  const base = NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID.startsWith("http")
    ? NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID
    : `https://checkout.lemonsqueezy.com/buy/${NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID}`;

  const url = new URL(base);
  const appBase = NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  url.searchParams.set("checkout[custom][server_id]", serverId);
  url.searchParams.set("checkout[email]", email);
  url.searchParams.set("checkout[success_url]", `${appBase}/checkout/success`);

  return url.toString();
}
