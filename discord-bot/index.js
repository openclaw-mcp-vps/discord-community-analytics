const { Client, Events, GatewayIntentBits, Partials } = require("discord.js");
const { createMemberCollector } = require("./collectors/memberCollector");
const { createMessageCollector } = require("./collectors/messageCollector");

const token = process.env.DISCORD_BOT_TOKEN;
const webhookUrl = process.env.DISCORD_INGEST_URL;

if (!token) {
  throw new Error("DISCORD_BOT_TOKEN is required.");
}

if (!webhookUrl) {
  throw new Error("DISCORD_INGEST_URL is required.");
}

const allowedServerIds = new Set(
  (process.env.DISCORD_SERVER_ALLOWLIST || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
);

const collectorConfig = {
  webhookUrl,
  webhookSecret: process.env.DISCORD_INGEST_SECRET,
  allowedServerIds
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.GuildMember]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`[discord-bot] Connected as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, createMessageCollector(collectorConfig));
client.on(Events.GuildMemberAdd, createMemberCollector(collectorConfig, "member.joined"));
client.on(Events.GuildMemberUpdate, (_, newMember) => createMemberCollector(collectorConfig, "member.updated")(newMember));

client.login(token);
