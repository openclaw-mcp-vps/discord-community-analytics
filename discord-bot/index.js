const {
  Client,
  Events,
  GatewayIntentBits,
  Partials
} = require("discord.js");

const { createMessageCollector } = require("./collectors/messageCollector");
const { collectMemberSnapshot } = require("./collectors/memberCollector");

const {
  DISCORD_BOT_TOKEN,
  DISCORD_GUILD_ID,
  ANALYTICS_WEBHOOK_URL,
  ANALYTICS_WEBHOOK_SECRET,
  MEMBER_SNAPSHOT_INTERVAL_MS
} = process.env;

if (!DISCORD_BOT_TOKEN) {
  throw new Error("Missing DISCORD_BOT_TOKEN");
}

if (!ANALYTICS_WEBHOOK_URL) {
  throw new Error("Missing ANALYTICS_WEBHOOK_URL");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const messageCollector = createMessageCollector({
  webhookUrl: ANALYTICS_WEBHOOK_URL,
  webhookSecret: ANALYTICS_WEBHOOK_SECRET
});

let memberSnapshotTimer = null;

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Discord analytics bot ready as ${readyClient.user.tag}`);

  const guildId = DISCORD_GUILD_ID || readyClient.guilds.cache.first()?.id;

  if (!guildId) {
    console.error("No guild found. Set DISCORD_GUILD_ID explicitly.");
    return;
  }

  try {
    const guild = await readyClient.guilds.fetch(guildId);

    const runMemberSnapshot = async () => {
      try {
        const count = await collectMemberSnapshot({
          guild,
          webhookUrl: ANALYTICS_WEBHOOK_URL,
          webhookSecret: ANALYTICS_WEBHOOK_SECRET
        });
        console.log(`Member snapshot synced: ${count} members`);
      } catch (error) {
        console.error("Member snapshot failed", error);
      }
    };

    await runMemberSnapshot();

    const interval = Number(MEMBER_SNAPSHOT_INTERVAL_MS || 60 * 60 * 1000);

    memberSnapshotTimer = setInterval(() => {
      void runMemberSnapshot();
    }, interval);
  } catch (error) {
    console.error("Failed to initialize guild data", error);
  }
});

client.on(Events.MessageCreate, (message) => {
  messageCollector.handleMessage(message);
});

async function shutdown() {
  console.log("Shutting down Discord analytics bot...");

  if (memberSnapshotTimer) {
    clearInterval(memberSnapshotTimer);
  }

  await messageCollector.stop();
  client.destroy();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});

client.login(DISCORD_BOT_TOKEN);
