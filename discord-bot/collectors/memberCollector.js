import axios from "axios";

function buildMemberPayload(type, member) {
  return {
    type,
    data: {
      id: member.id,
      username: member.user?.username ?? "unknown",
      serverId: member.guild.id,
      serverName: member.guild.name,
      joinedAt: member.joinedAt ? member.joinedAt.toISOString() : undefined,
      lastSeenAt: new Date().toISOString(),
      roles: member.roles.cache
        .filter((role) => role.name !== "@everyone")
        .map((role) => role.name)
    }
  };
}

async function sendMemberUpdate(type, member, config) {
  const payload = buildMemberPayload(type, member);
  await axios.post(config.webhookUrl, payload, {
    timeout: 4000,
    headers: {
      "content-type": "application/json",
      "x-discord-webhook-secret": config.webhookSecret
    }
  });
}

export async function collectMemberJoin(member, config) {
  await sendMemberUpdate("member.joined", member, config);
}

export async function collectMemberUpdate(member, config) {
  await sendMemberUpdate("member.updated", member, config);
}
