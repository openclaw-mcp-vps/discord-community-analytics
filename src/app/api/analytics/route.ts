import { NextRequest, NextResponse } from "next/server";

import { buildServerAnalytics } from "@/lib/analytics";
import { getAccessCookieName, verifyAccessToken } from "@/lib/paywall";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(getAccessCookieName())?.value;
  const access = verifyAccessToken(token);

  if (!access) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const url = new URL(request.url);
  const daysRaw = url.searchParams.get("days");
  const days = daysRaw ? Number(daysRaw) : 30;
  const safeDays = Number.isFinite(days) ? Math.min(Math.max(days, 7), 90) : 30;

  const analytics = await buildServerAnalytics(access.serverId, safeDays);

  return NextResponse.json(analytics);
}
