function buildMemberPayload(type, member) {
  return {
    type,
    eventId: `${type}:${member.guild.id}:${member.id}:${Date.now()}`,
    serverId: member.guild.id,
    memberId: member.id,
    username: member.displayName || member.user.username,
    roles: member.roles.cache
      .filter((role) => role.name !== "@everyone")
      .map((role) => role.name),
    avatarUrl: member.displayAvatarURL({ extension: "png", size: 128 }),
    createdAt: new Date().toISOString()
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

function createMemberCollector(config, type) {
  return async (member) => {
    try {
      if (!member.guild) {
        return;
      }

      if (config.allowedServerIds.size > 0 && !config.allowedServerIds.has(member.guild.id)) {
        return;
      }

      const payload = buildMemberPayload(type, member);
      await sendWebhook(config.webhookUrl, payload, config.webhookSecret);
    } catch (error) {
      console.error("[collector:member]", error);
    }
  };
}

module.exports = {
  createMemberCollector
};
