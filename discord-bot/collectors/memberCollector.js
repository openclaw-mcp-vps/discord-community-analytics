async function collectMemberSnapshot({ guild, webhookUrl, webhookSecret }) {
  if (!guild) {
    throw new Error("Guild is required for member snapshot collection");
  }

  if (!webhookUrl) {
    throw new Error("ANALYTICS_WEBHOOK_URL is required for member collector");
  }

  await guild.members.fetch();

  const members = guild.members.cache
    .filter((member) => !member.user.bot)
    .map((member) => ({
      memberId: member.id,
      username: member.displayName || member.user.username,
      joinedAt: member.joinedAt ? member.joinedAt.toISOString() : null,
      roles: member.roles.cache
        .map((role) => role.name)
        .filter((roleName) => roleName !== "@everyone")
    }));

  const payload = {
    eventType: "member_snapshot",
    serverId: guild.id,
    collectedAt: new Date().toISOString(),
    members
  };

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
    throw new Error(`Failed member snapshot webhook: ${response.status} ${body}`);
  }

  return members.length;
}

module.exports = {
  collectMemberSnapshot
};
