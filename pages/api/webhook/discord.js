import { appendMessage, upsertMember } from "@/lib/database/models";

function unauthorized(res) {
  res.status(401).json({ error: "Unauthorized webhook request" });
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const expectedSecret = process.env.DISCORD_WEBHOOK_SECRET;
  if (expectedSecret) {
    const providedSecret = req.headers["x-discord-webhook-secret"];
    if (providedSecret !== expectedSecret) {
      unauthorized(res);
      return;
    }
  }

  const payload = req.body;
  if (!payload || typeof payload !== "object") {
    res.status(400).json({ error: "Invalid JSON payload" });
    return;
  }

  if (payload.type === "message.created") {
    const message = payload.data;
    if (!message?.id || !message?.serverId || !message?.authorId) {
      res.status(400).json({ error: "Message payload missing required fields" });
      return;
    }

    appendMessage({
      id: String(message.id),
      serverId: String(message.serverId),
      serverName: String(message.serverName ?? "Discord Server"),
      channelId: String(message.channelId ?? "unknown"),
      channelName: String(message.channelName ?? "unknown"),
      authorId: String(message.authorId),
      authorUsername: String(message.authorUsername ?? message.authorId),
      content: String(message.content ?? ""),
      timestamp: String(message.timestamp ?? new Date().toISOString())
    });

    res.status(200).json({ ok: true, type: payload.type });
    return;
  }

  if (payload.type === "member.updated" || payload.type === "member.joined") {
    const member = payload.data;
    if (!member?.id || !member?.serverId || !member?.username) {
      res.status(400).json({ error: "Member payload missing required fields" });
      return;
    }

    upsertMember(
      String(member.serverId),
      {
        id: String(member.id),
        username: String(member.username),
        joinedAt: member.joinedAt ? String(member.joinedAt) : undefined,
        lastSeenAt: member.lastSeenAt ? String(member.lastSeenAt) : undefined,
        roles: Array.isArray(member.roles)
          ? member.roles.map((role) => String(role))
          : undefined
      },
      String(member.serverName ?? "Discord Server")
    );

    res.status(200).json({ ok: true, type: payload.type });
    return;
  }

  res.status(400).json({ error: "Unsupported webhook type" });
}
