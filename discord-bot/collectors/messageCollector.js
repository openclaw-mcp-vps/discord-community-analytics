import axios from "axios";

function normalizeContent(content) {
  if (!content || typeof content !== "string") {
    return "";
  }
  return content.replace(/\s+/g, " ").trim().slice(0, 2000);
}

export async function collectMessage(message, config) {
  if (!message.guild || message.author.bot) {
    return;
  }

  const payload = {
    type: "message.created",
    data: {
      id: message.id,
      serverId: message.guild.id,
      serverName: message.guild.name,
      channelId: message.channel.id,
      channelName: message.channel.name ?? "unknown",
      authorId: message.author.id,
      authorUsername: message.author.username,
      content: normalizeContent(message.content),
      timestamp: message.createdAt.toISOString()
    }
  };

  await axios.post(config.webhookUrl, payload, {
    timeout: 4000,
    headers: {
      "content-type": "application/json",
      "x-discord-webhook-secret": config.webhookSecret
    }
  });
}
