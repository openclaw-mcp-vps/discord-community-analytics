function initMessageCollector(client, config) {
  const queueByServer = new Map();
  const FLUSH_INTERVAL_MS = 10_000;
  const BATCH_LIMIT = 75;

  async function flushServer(serverId) {
    const queue = queueByServer.get(serverId);
    if (!queue || queue.length === 0) {
      return;
    }

    const batch = queue.splice(0, queue.length);

    try {
      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-ingest-secret": config.ingestSecret,
        },
        body: JSON.stringify({
          serverId,
          messages: batch,
          members: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }
    } catch (error) {
      console.error(`[messageCollector] failed to flush for guild ${serverId}:`, error.message);
      queue.unshift(...batch);
      queueByServer.set(serverId, queue.slice(0, 500));
    }
  }

  client.on("messageCreate", async (message) => {
    if (!message.guildId || message.author.bot) {
      return;
    }

    const payload = {
      id: message.id,
      channelId: message.channelId,
      authorId: message.author.id,
      authorName: message.member?.displayName || message.author.username,
      content: message.content || "",
      timestamp: new Date(message.createdTimestamp).toISOString(),
    };

    const queue = queueByServer.get(message.guildId) || [];
    queue.push(payload);
    queueByServer.set(message.guildId, queue);

    if (queue.length >= BATCH_LIMIT) {
      await flushServer(message.guildId);
    }
  });

  setInterval(() => {
    for (const serverId of queueByServer.keys()) {
      flushServer(serverId).catch((error) => {
        console.error(`[messageCollector] periodic flush failed for ${serverId}:`, error.message);
      });
    }
  }, FLUSH_INTERVAL_MS);
}

module.exports = {
  initMessageCollector,
};
