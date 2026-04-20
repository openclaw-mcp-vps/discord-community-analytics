const {
  Client,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const { initMessageCollector } = require("./collectors/messageCollector");
const { initMemberCollector } = require("./collectors/memberCollector");

const token = process.env.DISCORD_BOT_TOKEN;
const analyticsWebhookUrl =
  process.env.DCA_ANALYTICS_WEBHOOK_URL || "http://localhost:3000/api/webhook/discord";
const ingestSecret = process.env.DISCORD_INGEST_SECRET || "";

if (!token) {
  throw new Error("DISCORD_BOT_TOKEN is required.");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once("ready", () => {
  console.log(`[discord-bot] Logged in as ${client.user.tag}`);
});

initMessageCollector(client, {
  webhookUrl: analyticsWebhookUrl,
  ingestSecret,
});

initMemberCollector(client, {
  webhookUrl: analyticsWebhookUrl,
  ingestSecret,
});

client.login(token);
