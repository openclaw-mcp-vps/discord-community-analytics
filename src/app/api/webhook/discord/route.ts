import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getServerEnv } from "@/lib/env";
import { appendDiscordMembers, appendDiscordMessages } from "@/lib/storage";

const discordIngestSchema = z.object({
  serverId: z.string().min(1),
  messages: z
    .array(
      z.object({
        id: z.string().min(1),
        channelId: z.string().min(1),
        authorId: z.string().min(1),
        authorName: z.string().min(1),
        content: z.string(),
        timestamp: z.string().datetime(),
      })
    )
    .default([]),
  members: z
    .array(
      z.object({
        id: z.string().min(1),
        memberId: z.string().min(1),
        memberName: z.string().min(1),
        event: z.enum(["join", "leave", "presence"]),
        timestamp: z.string().datetime(),
      })
    )
    .default([]),
});

export async function POST(request: NextRequest) {
  const ingestSecret = request.headers.get("x-ingest-secret");
  const expectedSecret = getServerEnv().DISCORD_INGEST_SECRET;

  if (expectedSecret && ingestSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = discordIngestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;

  await appendDiscordMessages(
    payload.messages.map((message) => ({
      ...message,
      serverId: payload.serverId,
    }))
  );

  await appendDiscordMembers(
    payload.members.map((member) => ({
      ...member,
      serverId: payload.serverId,
    }))
  );

  return NextResponse.json({
    ok: true,
    ingested: {
      messages: payload.messages.length,
      members: payload.members.length,
    },
  });
}
