import { NextResponse } from "next/server";
import { calculateChurnRisk } from "@/lib/analytics/churnPredictor";
import { calculateEngagement } from "@/lib/analytics/engagementCalculator";
import { getServerSnapshot } from "@/lib/database/models";
import { ACCESS_COOKIE_NAME, hasServerAccess } from "@/lib/paywall";

export const dynamic = "force-dynamic";

interface AnalyticsRouteProps {
  params: Promise<{ serverId: string }>;
}

export async function GET(request: Request, context: AnalyticsRouteProps) {
  const { serverId } = await context.params;
  const cookieHeader = request.headers.get("cookie");
  const encodedCookie = cookieHeader
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${ACCESS_COOKIE_NAME}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  if (!hasServerAccess(encodedCookie, serverId)) {
    return NextResponse.json({ error: "paid access required" }, { status: 403 });
  }

  const { messages, members } = getServerSnapshot(serverId);
  const engagement = calculateEngagement(messages, members);
  const churn = calculateChurnRisk(members, messages);

  return NextResponse.json({
    serverId,
    generatedAt: new Date().toISOString(),
    memberCount: members.length,
    messageCount: messages.length,
    engagement,
    churn
  });
}
