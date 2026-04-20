function initMemberCollector(client, config) {
  const queueByServer = new Map();
  const FLUSH_INTERVAL_MS = 15_000;

  function enqueue(serverId, event) {
    const queue = queueByServer.get(serverId) || [];
    queue.push(event);
    queueByServer.set(serverId, queue);
  }

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
          messages: [],
          members: batch,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }
    } catch (error) {
      console.error(`[memberCollector] failed to flush for guild ${serverId}:`, error.message);
      queue.unshift(...batch);
      queueByServer.set(serverId, queue.slice(0, 500));
    }
  }

  client.on("guildMemberAdd", (member) => {
    enqueue(member.guild.id, {
      id: `join-${member.id}-${Date.now()}`,
      memberId: member.id,
      memberName: member.displayName || member.user.username,
      event: "join",
      timestamp: new Date().toISOString(),
    });
  });

  client.on("guildMemberRemove", (member) => {
    enqueue(member.guild.id, {
      id: `leave-${member.id}-${Date.now()}`,
      memberId: member.id,
      memberName: member.displayName || member.user.username,
      event: "leave",
      timestamp: new Date().toISOString(),
    });
  });

  setInterval(() => {
    for (const serverId of queueByServer.keys()) {
      flushServer(serverId).catch((error) => {
        console.error(`[memberCollector] periodic flush failed for ${serverId}:`, error.message);
      });
    }
  }, FLUSH_INTERVAL_MS);
}

module.exports = {
  initMemberCollector,
};
