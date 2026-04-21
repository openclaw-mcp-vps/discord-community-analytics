const DEFAULT_BATCH_SIZE = 40;
const DEFAULT_FLUSH_INTERVAL_MS = 15_000;

function createMessageCollector({
  webhookUrl,
  webhookSecret,
  batchSize = DEFAULT_BATCH_SIZE,
  flushIntervalMs = DEFAULT_FLUSH_INTERVAL_MS
}) {
  if (!webhookUrl) {
    throw new Error("Missing ANALYTICS_WEBHOOK_URL for message collector");
  }

  let queue = [];

  async function flush(reason = "scheduled") {
    if (queue.length === 0) {
      return;
    }

    const batch = queue;
    queue = [];

    const payload = {
      eventType: "message_batch",
      serverId: batch[0].serverId,
      reason,
      messages: batch
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(webhookSecret
            ? {
                "x-discord-analytics-secret": webhookSecret
              }
            : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = await response.text();
        console.error("Failed to flush message batch", response.status, body);
      }
    } catch (error) {
      console.error("Error posting message batch", error);
      queue = [...batch, ...queue];
    }
  }

  const flushTimer = setInterval(() => {
    void flush();
  }, flushIntervalMs);

  async function stop() {
    clearInterval(flushTimer);
    await flush("shutdown");
  }

  function handleMessage(message) {
    if (!message.guildId || !message.author || message.author.bot) {
      return;
    }

    if (!message.content || !message.content.trim()) {
      return;
    }

    queue.push({
      messageId: message.id,
      channelId: message.channelId,
      memberId: message.author.id,
      username: message.member?.displayName || message.author.username,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      serverId: message.guildId
    });

    if (queue.length >= batchSize) {
      void flush("batch_limit");
    }
  }

  return {
    handleMessage,
    flush,
    stop
  };
}

module.exports = {
  createMessageCollector
};
