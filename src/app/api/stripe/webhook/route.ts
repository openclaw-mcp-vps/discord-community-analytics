import { NextResponse } from "next/server";
import Stripe from "stripe";

import { upsertPurchaseEntitlement } from "@/lib/db";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_local");

function getEmailFromSession(session: Stripe.Checkout.Session) {
  const expandedCustomer = session.customer;

  const customerEmail =
    expandedCustomer &&
    typeof expandedCustomer !== "string" &&
    (!("deleted" in expandedCustomer) || !expandedCustomer.deleted)
      ? expandedCustomer.email
      : null;

  return (
    session.customer_details?.email ??
    session.customer_email ??
    customerEmail ??
    null
  );
}

export async function POST(request: Request) {
  const payloadText = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(payloadText, signature, webhookSecret);
    } catch {
      return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
    }
  } else {
    try {
      event = JSON.parse(payloadText) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = getEmailFromSession(session);

    if (email) {
      upsertPurchaseEntitlement(email, "active", "stripe_checkout_completed");
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const email = charge.billing_details?.email ?? null;

    if (email) {
      upsertPurchaseEntitlement(email, "revoked", "stripe_refund");
    }
  }

  return NextResponse.json({ received: true, type: event.type });
}
