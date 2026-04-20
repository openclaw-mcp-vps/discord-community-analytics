import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { subDays } from "date-fns";
import type {
  DataStore,
  MemberRecord,
  MessageRecord,
  PurchaseRecord,
  ServerRecord
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "analytics-store.json");
const DEMO_SERVER_ID = "demo-server";

function createEmptyStore(): DataStore {
  return {
    servers: {},
    purchases: []
  };
}

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function createSeedServer(): ServerRecord {
  const now = new Date();
  const random = seededRandom(42);
  const channels = [
    { id: "101", name: "general" },
    { id: "102", name: "announcements" },
    { id: "103", name: "support" },
    { id: "104", name: "showcase" },
    { id: "105", name: "off-topic" }
  ];

  const blueprints = [
    { id: "u1", name: "Avery", base: 9, recentMultiplier: 1.2 },
    { id: "u2", name: "Maya", base: 7, recentMultiplier: 1.0 },
    { id: "u3", name: "Noah", base: 8, recentMultiplier: 0.9 },
    { id: "u4", name: "Jordan", base: 6, recentMultiplier: 0.45 },
    { id: "u5", name: "Riley", base: 5, recentMultiplier: 0.35 },
    { id: "u6", name: "Kai", base: 4, recentMultiplier: 0.85 },
    { id: "u7", name: "Sasha", base: 4, recentMultiplier: 0.95 },
    { id: "u8", name: "Diego", base: 5, recentMultiplier: 0.8 },
    { id: "u9", name: "Imani", base: 3, recentMultiplier: 0.7 },
    { id: "u10", name: "Priya", base: 4, recentMultiplier: 0.6 },
    { id: "u11", name: "Leo", base: 2, recentMultiplier: 0.2 },
    { id: "u12", name: "Nina", base: 3, recentMultiplier: 0.3 }
  ];

  const phrases = [
    "Launching the onboarding sprint next week",
    "New moderation policy draft is ready for review",
    "Community spotlight submissions are open now",
    "Support queue response time improved after tagging",
    "Let's run a poll for game night format",
    "Weekly digest needs volunteer editors",
    "Retention dip appeared in the creator segment",
    "Could we improve newcomer welcome messages",
    "Voice stage recap posted in announcements",
    "Sharing growth experiment results from this month",
    "People liked the challenge leaderboard feature",
    "Can we pair mentors with first-time members",
    "Testing anti-spam threshold in support channel",
    "Feedback shows people want clearer role perks",
    "Working on referral campaign tracking dashboard"
  ];

  const members: Record<string, MemberRecord> = {};
  for (const profile of blueprints) {
    members[profile.id] = {
      id: profile.id,
      username: profile.name,
      joinedAt: subDays(now, 180 + Math.floor(random() * 250)).toISOString(),
      lastSeenAt: subDays(now, Math.floor(random() * 3)).toISOString(),
      messageCount: 0,
      roles: ["member"]
    };
  }

  const messages: MessageRecord[] = [];

  for (let daysAgo = 70; daysAgo >= 0; daysAgo -= 1) {
    const dayDate = subDays(now, daysAgo);
    const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

    for (const profile of blueprints) {
      const weeklyPattern = isWeekend ? 0.7 : 1;
      const recentPattern = daysAgo <= 14 ? profile.recentMultiplier : 1;
      const noise = 0.8 + random() * 0.8;
      const expectedMessages = profile.base * weeklyPattern * recentPattern * noise;
      const messageCount = Math.max(0, Math.round(expectedMessages));

      for (let i = 0; i < messageCount; i += 1) {
        const channel = channels[Math.floor(random() * channels.length)] ?? channels[0];
        const minuteOffset = Math.floor(random() * 1200);
        const messageDate = new Date(dayDate.getTime() + minuteOffset * 60_000);
        const phrase = phrases[Math.floor(random() * phrases.length)] ?? "Checking in";
        const record: MessageRecord = {
          id: `seed-${daysAgo}-${profile.id}-${i}`,
          serverId: DEMO_SERVER_ID,
          serverName: "Growth Guild Demo",
          channelId: channel.id,
          channelName: channel.name,
          authorId: profile.id,
          authorUsername: profile.name,
          content: phrase,
          timestamp: messageDate.toISOString()
        };
        messages.push(record);
        members[profile.id].messageCount += 1;
        if (messageDate.toISOString() > members[profile.id].lastSeenAt) {
          members[profile.id].lastSeenAt = messageDate.toISOString();
        }
      }
    }
  }

  return {
    id: DEMO_SERVER_ID,
    name: "Growth Guild Demo",
    messages: messages.sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp)
    ),
    members,
    updatedAt: now.toISOString()
  };
}

function ensureDataStoreExists() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!existsSync(STORE_PATH)) {
    const initial = createEmptyStore();
    initial.servers[DEMO_SERVER_ID] = createSeedServer();
    writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), "utf-8");
  }
}

function readStore(): DataStore {
  ensureDataStoreExists();
  const raw = readFileSync(STORE_PATH, "utf-8");
  const parsed = JSON.parse(raw) as DataStore;

  if (!parsed.servers[DEMO_SERVER_ID]) {
    parsed.servers[DEMO_SERVER_ID] = createSeedServer();
    writeStore(parsed);
  }

  return parsed;
}

function writeStore(store: DataStore) {
  ensureDataStoreExists();
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function ensureServer(
  store: DataStore,
  serverId: string,
  serverName: string
): ServerRecord {
  const existing = store.servers[serverId];
  if (existing) {
    return existing;
  }

  const created: ServerRecord = {
    id: serverId,
    name: serverName,
    messages: [],
    members: {},
    updatedAt: new Date().toISOString()
  };
  store.servers[serverId] = created;
  return created;
}

export function listServers(): ServerRecord[] {
  const store = readStore();
  return Object.values(store.servers);
}

export function getServer(serverId: string): ServerRecord | null {
  const store = readStore();
  return store.servers[serverId] ?? null;
}

export function upsertMember(serverId: string, member: Partial<MemberRecord> & { id: string; username: string }, serverName = "Discord Server") {
  const store = readStore();
  const server = ensureServer(store, serverId, serverName);

  const existing = server.members[member.id];
  const now = new Date().toISOString();

  server.members[member.id] = {
    id: member.id,
    username: member.username,
    joinedAt: existing?.joinedAt ?? member.joinedAt ?? now,
    lastSeenAt: member.lastSeenAt ?? existing?.lastSeenAt ?? now,
    messageCount: member.messageCount ?? existing?.messageCount ?? 0,
    roles: member.roles ?? existing?.roles ?? ["member"]
  };

  server.updatedAt = now;
  writeStore(store);
  return server.members[member.id];
}

export function appendMessage(message: MessageRecord) {
  const store = readStore();
  const server = ensureServer(store, message.serverId, message.serverName);

  const alreadyExists = server.messages.some((entry) => entry.id === message.id);
  if (alreadyExists) {
    return;
  }

  server.messages.push(message);

  const existingMember = server.members[message.authorId];
  server.members[message.authorId] = {
    id: message.authorId,
    username: message.authorUsername,
    joinedAt: existingMember?.joinedAt ?? message.timestamp,
    lastSeenAt: message.timestamp,
    messageCount: (existingMember?.messageCount ?? 0) + 1,
    roles: existingMember?.roles ?? ["member"]
  };

  if (server.messages.length > 120_000) {
    server.messages = server.messages.slice(-120_000);
  }

  server.updatedAt = new Date().toISOString();
  writeStore(store);
}

export function recordPurchase(purchase: PurchaseRecord) {
  const store = readStore();
  const existingIndex = store.purchases.findIndex(
    (entry) => entry.orderId === purchase.orderId
  );

  if (existingIndex >= 0) {
    store.purchases[existingIndex] = {
      ...store.purchases[existingIndex],
      ...purchase,
      updatedAt: new Date().toISOString()
    };
  } else {
    store.purchases.push({
      ...purchase,
      updatedAt: purchase.updatedAt ?? new Date().toISOString()
    });
  }

  writeStore(store);
}

export function findPurchase(orderId: string, email: string) {
  const store = readStore();
  return (
    store.purchases.find(
      (entry) =>
        entry.orderId === orderId &&
        entry.email.toLowerCase() === email.toLowerCase() &&
        entry.status === "paid"
    ) ?? null
  );
}
