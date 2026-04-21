import "server-only";

import jwt from "jsonwebtoken";

const ACCESS_COOKIE_NAME = "dca_access";
const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

interface AccessTokenPayload {
  email: string;
  iat?: number;
  exp?: number;
}

function getPaywallSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET ?? "local-dev-paywall-secret";
}

export function getAccessCookieName() {
  return ACCESS_COOKIE_NAME;
}

export function getAccessTokenMaxAgeSeconds() {
  return ACCESS_TOKEN_MAX_AGE_SECONDS;
}

export function signAccessToken(email: string) {
  return jwt.sign({ email: email.toLowerCase().trim() }, getPaywallSecret(), {
    expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS
  });
}

export function verifyAccessToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getPaywallSecret()) as AccessTokenPayload;

    if (!payload.email) {
      return null;
    }

    return { email: payload.email };
  } catch {
    return null;
  }
}
