import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createAccessToken, getAccessCookieMaxAgeSeconds, getAccessCookieName } from "@/lib/paywall";
import { readPurchases } from "@/lib/storage";

const activateSchema = z.object({
  orderId: z.string().optional(),
  email: z.string().email().optional(),
  serverId: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = activateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { orderId, email, serverId } = parsed.data;
  if (!orderId && !email) {
    return NextResponse.json({ error: "Provide either orderId or email" }, { status: 400 });
  }

  const purchases = await readPurchases();
  const match = purchases.find((purchase) => {
    const paidStatus = purchase.status === "paid";
    const orderMatch = orderId ? purchase.orderId === orderId : true;
    const emailMatch = email ? purchase.email === email.toLowerCase() : true;
    const serverMatch = serverId ? purchase.serverId === serverId : true;
    return paidStatus && orderMatch && emailMatch && serverMatch;
  });

  if (!match) {
    return NextResponse.json(
      {
        error:
          "No paid order found yet. Confirm your webhook is configured and try again in a few seconds.",
      },
      { status: 404 }
    );
  }

  const token = createAccessToken(match.orderId, match.email, match.serverId);

  const response = NextResponse.json({ ok: true, serverId: match.serverId });
  response.cookies.set(getAccessCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: getAccessCookieMaxAgeSeconds(),
    path: "/",
  });

  return response;
}
