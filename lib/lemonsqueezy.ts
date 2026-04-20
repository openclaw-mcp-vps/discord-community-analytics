import { createHmac, timingSafeEqual } from "node:crypto";

interface BuildCheckoutUrlInput {
  productId: string;
  serverId: string;
  token: string;
  email?: string;
  redirectUrl: string;
}

interface ExtractedWebhookData {
  eventName?: string;
  eventId?: string;
  serverId?: string;
  token?: string;
  email?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  isPaidEvent: boolean;
}

export function buildCheckoutUrl({ productId, serverId, token, email, redirectUrl }: BuildCheckoutUrlInput): string {
  const checkoutUrl = new URL(`https://app.lemonsqueezy.com/checkout/buy/${productId}`);

  checkoutUrl.searchParams.set("checkout[custom][server_id]", serverId);
  checkoutUrl.searchParams.set("checkout[custom][dca_token]", token);
  checkoutUrl.searchParams.set("checkout[checkout_options][embed]", "1");
  checkoutUrl.searchParams.set("checkout[checkout_options][dark]", "1");
  checkoutUrl.searchParams.set("checkout[checkout_options][media]", "0");
  checkoutUrl.searchParams.set("checkout[checkout_options][button_color]", "#58a6ff");
  checkoutUrl.searchParams.set("checkout[checkout_options][redirect_url]", redirectUrl);

  if (email) {
    checkoutUrl.searchParams.set("checkout[email]", email);
    checkoutUrl.searchParams.set("checkout[custom][manager_email]", email);
  }

  return checkoutUrl.toString();
}

export function verifyLemonSignature(rawBody: string, secret: string, signature?: string | null): boolean {
  if (!signature) {
    return false;
  }

  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");

  const signatureBuffer = Buffer.from(signature, "utf8");
  const digestBuffer = Buffer.from(digest, "utf8");

  if (signatureBuffer.length !== digestBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, digestBuffer);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function extractWebhookData(payload: Record<string, any>): ExtractedWebhookData {
  const eventName = asString(payload?.meta?.event_name);
  const eventId = asString(payload?.meta?.webhook_event_id) ?? asString(payload?.data?.id);

  const customData = payload?.meta?.custom_data ?? payload?.data?.attributes?.custom_data ?? {};
  const firstOrderItem = payload?.data?.attributes?.first_order_item ?? {};

  const serverId =
    asString(customData?.server_id) ??
    asString(customData?.serverId) ??
    asString(firstOrderItem?.custom_data?.server_id) ??
    asString(firstOrderItem?.custom_data?.serverId);

  const token =
    asString(customData?.dca_token) ??
    asString(customData?.token) ??
    asString(firstOrderItem?.custom_data?.dca_token) ??
    asString(firstOrderItem?.custom_data?.token);

  const email =
    asString(payload?.data?.attributes?.user_email) ??
    asString(payload?.data?.attributes?.customer_email) ??
    asString(customData?.manager_email);

  const orderId = asString(payload?.data?.id) ?? asString(payload?.data?.attributes?.identifier);

  const amount =
    asNumber(payload?.data?.attributes?.total) ??
    asNumber(payload?.data?.attributes?.subtotal) ??
    asNumber(payload?.data?.attributes?.subtotal_usd);

  const currency =
    asString(payload?.data?.attributes?.currency) ?? asString(payload?.data?.attributes?.currency_code) ?? "USD";

  const isPaidEvent =
    eventName === "order_created" ||
    eventName === "subscription_created" ||
    eventName === "subscription_payment_success";

  return {
    eventName,
    eventId,
    serverId,
    token,
    email,
    orderId,
    amount,
    currency,
    isPaidEvent
  };
}
