import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { DiscordEventStore, PurchaseRecord } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DISCORD_EVENTS_PATH = path.join(DATA_DIR, "discord-events.json");
const PURCHASES_PATH = path.join(DATA_DIR, "purchases.json");

const DEFAULT_EVENT_STORE: DiscordEventStore = {
  messages: [],
  members: [],
};

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonAtomic<T>(filePath: string, value: T) {
  await ensureDataDir();
  const tmpPath = `${filePath}.tmp`;
  await writeFile(tmpPath, JSON.stringify(value, null, 2), "utf8");
  await rename(tmpPath, filePath);
}

export async function readDiscordEventStore(): Promise<DiscordEventStore> {
  await ensureDataDir();
  return readJsonFile(DISCORD_EVENTS_PATH, DEFAULT_EVENT_STORE);
}

export async function appendDiscordMessages(
  messages: DiscordEventStore["messages"]
): Promise<void> {
  if (messages.length === 0) {
    return;
  }

  const store = await readDiscordEventStore();
  store.messages.push(...messages);

  if (store.messages.length > 150_000) {
    store.messages = store.messages.slice(-150_000);
  }

  await writeJsonAtomic(DISCORD_EVENTS_PATH, store);
}

export async function appendDiscordMembers(
  members: DiscordEventStore["members"]
): Promise<void> {
  if (members.length === 0) {
    return;
  }

  const store = await readDiscordEventStore();
  store.members.push(...members);

  if (store.members.length > 20_000) {
    store.members = store.members.slice(-20_000);
  }

  await writeJsonAtomic(DISCORD_EVENTS_PATH, store);
}

export async function readPurchases(): Promise<PurchaseRecord[]> {
  await ensureDataDir();
  return readJsonFile(PURCHASES_PATH, []);
}

export async function upsertPurchase(record: PurchaseRecord): Promise<void> {
  const purchases = await readPurchases();
  const idx = purchases.findIndex((p) => p.orderId === record.orderId);

  if (idx >= 0) {
    purchases[idx] = record;
  } else {
    purchases.push(record);
  }

  if (purchases.length > 20_000) {
    purchases.splice(0, purchases.length - 20_000);
  }

  await writeJsonAtomic(PURCHASES_PATH, purchases);
}
