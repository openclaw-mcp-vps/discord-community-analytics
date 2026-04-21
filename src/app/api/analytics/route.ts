import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAnalyticsSnapshot } from "@/lib/analytics";
import { getAccessCookieName, verifyAccessToken } from "@/lib/paywall";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(getAccessCookieName())?.value;
  const access = verifyAccessToken(accessToken);

  if (!access) {
    return NextResponse.json({ error: "Payment required." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const serverId = searchParams.get("serverId") ?? undefined;

  const snapshot = getAnalyticsSnapshot(serverId);

  return NextResponse.json(snapshot);
}
