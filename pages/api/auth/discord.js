export default function handler(req, res) {
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId) {
    res.status(500).json({
      error:
        "DISCORD_CLIENT_ID is not set. Add it to your environment before using bot install flow."
    });
    return;
  }

  const guildId =
    typeof req.query.serverId === "string" && req.query.serverId
      ? req.query.serverId
      : undefined;

  const params = new URLSearchParams({
    client_id: clientId,
    permissions: "274877910016",
    scope: "bot applications.commands"
  });

  if (guildId) {
    params.set("guild_id", guildId);
    params.set("disable_guild_select", "true");
  }

  const oauthUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
  res.redirect(oauthUrl);
}
