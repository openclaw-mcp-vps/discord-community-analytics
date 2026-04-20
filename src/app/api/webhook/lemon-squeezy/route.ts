import { NextRequest, NextResponse } from "next/server";

import { upsertPurchase } from "@/lib/storage";
import { verifyLemonWebhookSignature } from "@/lib/paywall";

interface LemonWebhookPayload {
  meta?: {
    event_name?: string;
  };
  data?: {
    id?: string;
    attributes?: {
      order_id?: number | string;
      user_email?: string;
      customer_email?: string;
      status?: string;
      custom_data?: {
        server_id?: string;
      };
    };
  };
}

function inferStatus(eventName: string | undefined, status: string | undefined) {
  const event = (eventName ?? "").toLowerCase();
  const normalizedStatus = (status ?? "").toLowerCase();

  if (event.includes("refund") || normalizedStatus === "refunded") {
    return "refunded" as const;
  }

  if (event.includes("cancel") || normalizedStatus === "cancelled") {
    return "cancelled" as const;
  }

  return "paid" as const;
}

export async function POST(request: NextRequest) {
  const bodyText = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyLemonWebhookSignature(bodyText, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(bodyText) as LemonWebhookPayload;

  const eventName = payload.meta?.event_name;
  const attributes = payload.data?.attributes;

  const orderId = String(attributes?.order_id ?? payload.data?.id ?? "").trim();
  const email = String(attributes?.user_email ?? attributes?.customer_email ?? "").trim();
  const serverId = String(attributes?.custom_data?.server_id ?? "unknown").trim();

  if (!orderId || !email) {
    return NextResponse.json({ error: "Missing order context" }, { status: 400 });
  }

  await upsertPurchase({
    orderId,
    email: email.toLowerCase(),
    serverId,
    status: inferStatus(eventName, attributes?.status),
    createdAt: new Date().toISOString(),
    rawEventName: eventName ?? "unknown",
  });

  return NextResponse.json({ ok: true });
}
