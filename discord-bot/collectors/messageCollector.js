function buildMessagePayload(message) {
  return {
    type: "message.created",
    eventId: message.id,
    serverId: message.guild.id,
    channelId: message.channel.id,
    memberId: message.author.id,
    username: message.member?.displayName || message.author.username,
    content: message.content || "",
    createdAt: message.createdAt.toISOString()
  };
}

async function sendWebhook(webhookUrl, payload, secret) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (secret) {
    headers["x-discord-ingest-secret"] = secret;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Discord ingest webhook failed (${response.status}): ${responseText}`);
  }
}

function createMessageCollector(config) {
  return async (message) => {
    try {
      if (!message.guild || message.author.bot || !message.content) {
        return;
      }

      if (config.allowedServerIds.size > 0 && !config.allowedServerIds.has(message.guild.id)) {
        return;
      }

      const payload = buildMessagePayload(message);
      await sendWebhook(config.webhookUrl, payload, config.webhookSecret);
    } catch (error) {
      console.error("[collector:message]", error);
    }
  };
}

module.exports = {
  createMessageCollector
};
