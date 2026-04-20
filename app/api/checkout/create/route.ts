import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/database/models";
import { buildCheckoutUrl } from "@/lib/lemonsqueezy";

export const dynamic = "force-dynamic";

interface CheckoutPayload {
  serverId?: string;
  email?: string;
}

export async function POST(request: Request) {
  let payload: CheckoutPayload;

  try {
    payload = (await request.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const serverId = payload.serverId?.trim();
  const email = payload.email?.trim();

  if (!serverId) {
    return NextResponse.json({ error: "serverId is required" }, { status: 400 });
  }

  const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
  const storeId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;

  if (!productId || !storeId) {
    return NextResponse.json(
      {
        error: "NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID and NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID are required"
      },
      { status: 500 }
    );
  }

  const session = createCheckoutSession(serverId, email);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUrl = `${appUrl}/purchase/success?serverId=${encodeURIComponent(serverId)}&token=${encodeURIComponent(session.token)}`;

  const checkoutUrl = buildCheckoutUrl({
    productId,
    serverId,
    token: session.token,
    email,
    redirectUrl
  });

  return NextResponse.json({
    ok: true,
    checkoutUrl,
    token: session.token,
    serverId,
    storeId
  });
}
