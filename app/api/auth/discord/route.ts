import { NextResponse } from "next/server";
import { hasPaidAccess } from "@/lib/database/models";
import { ACCESS_COOKIE_NAME, hasServerAccess, withServerAccess } from "@/lib/paywall";

export const dynamic = "force-dynamic";

interface AuthPayload {
  serverId?: string;
  token?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serverId = searchParams.get("serverId");

  if (!serverId) {
    return NextResponse.json({ error: "serverId is required" }, { status: 400 });
  }

  const cookieHeader = request.headers.get("cookie");
  const encodedCookie = cookieHeader
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${ACCESS_COOKIE_NAME}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  return NextResponse.json({
    serverId,
    hasAccess: hasServerAccess(encodedCookie, serverId)
  });
}

export async function POST(request: Request) {
  let payload: AuthPayload;

  try {
    payload = (await request.json()) as AuthPayload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!payload.serverId) {
    return NextResponse.json({ error: "serverId is required" }, { status: 400 });
  }

  const paid = hasPaidAccess(payload.serverId, payload.token);

  if (!paid) {
    return NextResponse.json(
      {
        error: "Purchase not verified yet. Wait for Lemon Squeezy webhook then retry."
      },
      { status: 402 }
    );
  }

  const cookieHeader = request.headers.get("cookie");
  const currentCookieValue = cookieHeader
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${ACCESS_COOKIE_NAME}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  const response = NextResponse.json({ ok: true, serverId: payload.serverId });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: withServerAccess(currentCookieValue, payload.serverId),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
