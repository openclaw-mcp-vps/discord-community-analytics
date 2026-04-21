import { NextResponse } from "next/server";

import {
  normalizeIncomingMembers,
  normalizeIncomingMessages,
  storeMemberSnapshot,
  storeMessageBatch
} from "@/lib/analytics";
import type { DiscordWebhookPayload } from "@/lib/types";

export const runtime = "nodejs";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized webhook request." }, { status: 401 });
}

export async function POST(request: Request) {
  const expectedSecret = process.env.DISCORD_WEBHOOK_SECRET;
  const incomingSecret = request.headers.get("x-discord-analytics-secret");

  if (expectedSecret && incomingSecret !== expectedSecret) {
    return unauthorizedResponse();
  }

  let payload: DiscordWebhookPayload;

  try {
    payload = (await request.json()) as DiscordWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload || !payload.eventType || !payload.serverId) {
    return NextResponse.json({ error: "Missing eventType or serverId." }, { status: 400 });
  }

  if (payload.eventType === "message_batch") {
    const rows = normalizeIncomingMessages(payload.serverId, payload.messages ?? []);
    storeMessageBatch(rows);

    return NextResponse.json({
      ok: true,
      eventType: payload.eventType,
      insertedMessages: rows.length
    });
  }

  if (payload.eventType === "member_snapshot") {
    const collectedAt = payload.collectedAt ?? new Date().toISOString();
    const rows = normalizeIncomingMembers(payload.serverId, collectedAt, payload.members ?? []);
    storeMemberSnapshot(rows);

    return NextResponse.json({
      ok: true,
      eventType: payload.eventType,
      insertedMembers: rows.length,
      collectedAt
    });
  }

  return NextResponse.json({ error: "Unsupported eventType." }, { status: 400 });
}
