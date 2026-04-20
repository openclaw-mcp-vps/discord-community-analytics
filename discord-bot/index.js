import {
  Client,
  Events,
  GatewayIntentBits,
  Partials
} from "discord.js";
import { collectMessage } from "./collectors/messageCollector.js";
import {
  collectMemberJoin,
  collectMemberUpdate
} from "./collectors/memberCollector.js";

const required = ["DISCORD_BOT_TOKEN", "ANALYTICS_WEBHOOK_URL", "DISCORD_WEBHOOK_SECRET"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const config = {
  webhookUrl: process.env.ANALYTICS_WEBHOOK_URL,
  webhookSecret: process.env.DISCORD_WEBHOOK_SECRET
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Discord analytics bot online as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  try {
    await collectMessage(message, config);
  } catch (error) {
    console.error("Failed to send message event", error.message);
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    await collectMemberJoin(member, config);
  } catch (error) {
    console.error("Failed to send member join event", error.message);
  }
});

client.on(Events.GuildMemberUpdate, async (_oldMember, newMember) => {
  try {
    await collectMemberUpdate(newMember, config);
  } catch (error) {
    console.error("Failed to send member update event", error.message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
