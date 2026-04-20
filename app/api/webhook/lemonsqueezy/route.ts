import { NextResponse } from "next/server";
import { markCheckoutPaid, recordWebhookEvent } from "@/lib/database/models";
import { extractWebhookData, verifyLemonSignature } from "@/lib/lemonsqueezy";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");
  const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

  if (webhookSecret && !verifyLemonSignature(rawBody, webhookSecret, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: Record<string, any>;

  try {
    payload = JSON.parse(rawBody) as Record<string, any>;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const details = extractWebhookData(payload);

  if (details.eventId) {
    const accepted = recordWebhookEvent("lemonsqueezy", details.eventId);
    if (!accepted) {
      return NextResponse.json({ ok: true, deduped: true });
    }
  }

  if (details.isPaidEvent) {
    const purchase = markCheckoutPaid({
      token: details.token,
      serverId: details.serverId,
      email: details.email,
      lemonOrderId: details.orderId,
      amount: details.amount,
      currency: details.currency
    });

    if (!purchase) {
      return NextResponse.json({ error: "unable to map payment to server" }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true, event: details.eventName ?? "unknown" });
}
