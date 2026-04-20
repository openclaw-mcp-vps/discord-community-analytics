import { createPaywallToken } from "@/lib/paywall/session";
import { findPurchase } from "@/lib/database/models";

function serializeCookie(name, value, maxAgeSeconds) {
  const parts = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { orderId, email, serverId } = req.body ?? {};
  if (!orderId || !email || !serverId) {
    res.status(400).json({ error: "orderId, email, and serverId are required" });
    return;
  }

  const purchase = findPurchase(String(orderId), String(email));
  if (!purchase) {
    res.status(404).json({
      error:
        "Purchase not found yet. Make sure webhook delivery succeeded and the email/order ID match exactly."
    });
    return;
  }

  if (purchase.serverId !== String(serverId)) {
    res.status(403).json({
      error:
        `This order is linked to server ${purchase.serverId}. Use that server ID to unlock access.`
    });
    return;
  }

  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ?? "local-dev-secret";
  const token = createPaywallToken(
    {
      orderId: purchase.orderId,
      email: purchase.email,
      serverId: purchase.serverId
    },
    secret,
    35
  );

  res.setHeader("Set-Cookie", serializeCookie("dca_paid", token, 35 * 24 * 60 * 60));
  res.status(200).json({ ok: true, serverId: purchase.serverId });
}
