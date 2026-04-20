import crypto from "crypto";
import { recordPurchase } from "@/lib/database/models";

export const config = {
  api: {
    bodyParser: false
  }
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function verifySignature(rawBody, signature, secret) {
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (signature.length !== digest.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

function inferPaidStatus(eventName, status) {
  if (eventName.includes("refund") || status === "refunded") {
    return "refunded";
  }
  if (eventName.includes("order") || eventName.includes("payment") || status === "paid") {
    return "paid";
  }
  return "pending";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  const signature = req.headers["x-signature"];

  if (!secret) {
    res.status(500).json({ error: "Webhook secret is not configured" });
    return;
  }

  if (!signature || Array.isArray(signature)) {
    res.status(401).json({ error: "Missing webhook signature" });
    return;
  }

  const rawBody = await readRawBody(req);
  if (!verifySignature(rawBody, signature, secret)) {
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString("utf-8"));
  } catch {
    res.status(400).json({ error: "Invalid JSON payload" });
    return;
  }

  const eventName = String(payload?.meta?.event_name ?? "unknown");
  const attrs = payload?.data?.attributes ?? {};
  const customMeta = {
    ...(payload?.meta?.custom_data ?? {}),
    ...(attrs?.custom_data ?? {})
  };

  const orderId = String(
    attrs.order_number ?? attrs.identifier ?? payload?.data?.id ?? ""
  );
  const email = String(
    attrs.user_email ?? attrs.customer_email ?? attrs.email ?? ""
  ).trim();
  const serverId = String(customMeta.server_id ?? customMeta.serverId ?? "demo-server");
  const productId = String(
    attrs?.first_order_item?.product_id ?? attrs.product_id ?? process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID ?? ""
  );

  if (!orderId || !email) {
    res.status(200).json({ ok: true, skipped: true, reason: "No order/email in payload" });
    return;
  }

  recordPurchase({
    orderId,
    email,
    serverId,
    status: inferPaidStatus(eventName, String(attrs.status ?? "")),
    productId,
    customerName: attrs.user_name ? String(attrs.user_name) : undefined,
    updatedAt: new Date().toISOString()
  });

  res.status(200).json({ ok: true, eventName, orderId, serverId });
}
