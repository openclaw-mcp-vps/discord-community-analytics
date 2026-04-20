import { NextResponse } from "next/server";
import { addMessage, recordWebhookEvent, upsertMember } from "@/lib/database/models";

interface DiscordWebhookPayload {
  type: "message.created" | "member.updated" | "member.joined";
  eventId?: string;
  serverId: string;
  channelId?: string;
  memberId: string;
  username: string;
  content?: string;
  roles?: string[];
  avatarUrl?: string;
  createdAt?: string;
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ingestSecret = process.env.DISCORD_INGEST_SECRET;
  const signature = request.headers.get("x-discord-ingest-secret");

  if (ingestSecret && signature !== ingestSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: DiscordWebhookPayload;

  try {
    payload = (await request.json()) as DiscordWebhookPayload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!payload.type || !payload.serverId || !payload.memberId || !payload.username) {
    return NextResponse.json({ error: "missing required fields" }, { status: 400 });
  }

  if (payload.eventId) {
    const accepted = recordWebhookEvent("discord", payload.eventId);
    if (!accepted) {
      return NextResponse.json({ ok: true, deduped: true });
    }
  }

  if (payload.type === "message.created") {
    if (!payload.channelId || typeof payload.content !== "string") {
      return NextResponse.json({ error: "message event requires channelId and content" }, { status: 400 });
    }

    const message = addMessage({
      id: payload.eventId,
      serverId: payload.serverId,
      channelId: payload.channelId,
      memberId: payload.memberId,
      username: payload.username,
      content: payload.content,
      createdAt: payload.createdAt
    });

    return NextResponse.json({ ok: true, messageId: message.id });
  }

  const member = upsertMember({
    id: payload.memberId,
    serverId: payload.serverId,
    username: payload.username,
    roles: payload.roles ?? [],
    avatarUrl: payload.avatarUrl,
    joinedAt: payload.createdAt,
    lastActiveAt: payload.createdAt
  });

  return NextResponse.json({ ok: true, memberId: member.id });
}
