import { NextResponse } from "next/server";

import { getPurchaseEntitlement } from "@/lib/db";
import {
  getAccessCookieName,
  getAccessTokenMaxAgeSeconds,
  signAccessToken
} from "@/lib/paywall";

export const runtime = "nodejs";

interface ActivateBody {
  email?: string;
}

export async function POST(request: Request) {
  let body: ActivateBody;

  try {
    body = (await request.json()) as ActivateBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "A valid billing email is required." }, { status: 400 });
  }

  const entitlement = getPurchaseEntitlement(email);

  if (!entitlement || entitlement.status !== "active") {
    return NextResponse.json(
      {
        error:
          "No active purchase found for this email yet. Complete checkout, then wait for webhook confirmation."
      },
      { status: 403 }
    );
  }

  const token = signAccessToken(email);
  const response = NextResponse.json({ ok: true, email });

  response.cookies.set({
    name: getAccessCookieName(),
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: getAccessTokenMaxAgeSeconds(),
    path: "/"
  });

  return response;
}
