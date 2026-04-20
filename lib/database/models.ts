import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  CheckoutSession,
  DatabaseSchema,
  MemberRecord,
  MessageRecord,
  PurchaseRecord,
  WebhookEventRecord
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const EMPTY_DB: DatabaseSchema = {
  messages: [],
  members: [],
  checkoutSessions: [],
  purchases: [],
  webhookEvents: []
};

function ensureDatabase(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(EMPTY_DB, null, 2), "utf8");
  }
}

function saveDatabase(database: DatabaseSchema): void {
  ensureDatabase();
  fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), "utf8");
}

export function readDatabase(): DatabaseSchema {
  ensureDatabase();

  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;

    return {
      messages: parsed.messages ?? [],
      members: parsed.members ?? [],
      checkoutSessions: parsed.checkoutSessions ?? [],
      purchases: parsed.purchases ?? [],
      webhookEvents: parsed.webhookEvents ?? []
    };
  } catch {
    saveDatabase(EMPTY_DB);
    return { ...EMPTY_DB };
  }
}

export function recordWebhookEvent(source: WebhookEventRecord["source"], id: string): boolean {
  const database = readDatabase();

  if (database.webhookEvents.some((event) => event.source === source && event.id === id)) {
    return false;
  }

  database.webhookEvents.push({
    source,
    id,
    receivedAt: new Date().toISOString()
  });

  if (database.webhookEvents.length > 5000) {
    database.webhookEvents = database.webhookEvents.slice(-5000);
  }

  saveDatabase(database);
  return true;
}

export function upsertMember(input: Omit<MemberRecord, "joinedAt" | "lastActiveAt"> & Partial<Pick<MemberRecord, "joinedAt" | "lastActiveAt">>): MemberRecord {
  const database = readDatabase();
  const now = new Date().toISOString();
  const index = database.members.findIndex((member) => member.serverId === input.serverId && member.id === input.id);

  const normalized: MemberRecord = {
    id: input.id,
    serverId: input.serverId,
    username: input.username,
    roles: input.roles ?? [],
    avatarUrl: input.avatarUrl,
    joinedAt: input.joinedAt ?? now,
    lastActiveAt: input.lastActiveAt ?? now
  };

  if (index >= 0) {
    const current = database.members[index];
    database.members[index] = {
      ...current,
      ...normalized,
      joinedAt: current.joinedAt || normalized.joinedAt,
      lastActiveAt: input.lastActiveAt ?? current.lastActiveAt ?? now
    };
  } else {
    database.members.push(normalized);
  }

  saveDatabase(database);

  return index >= 0 ? database.members[index] : normalized;
}

export function addMessage(input: Omit<MessageRecord, "id" | "createdAt"> & Partial<Pick<MessageRecord, "id" | "createdAt">>): MessageRecord {
  const database = readDatabase();

  const createdMessage: MessageRecord = {
    id: input.id ?? randomUUID(),
    serverId: input.serverId,
    channelId: input.channelId,
    memberId: input.memberId,
    username: input.username,
    content: input.content,
    createdAt: input.createdAt ?? new Date().toISOString()
  };

  const existingIndex = database.messages.findIndex(
    (message) => message.id === createdMessage.id && message.serverId === createdMessage.serverId
  );

  if (existingIndex === -1) {
    database.messages.push(createdMessage);
  }

  const memberIndex = database.members.findIndex(
    (member) => member.serverId === createdMessage.serverId && member.id === createdMessage.memberId
  );

  if (memberIndex >= 0) {
    database.members[memberIndex] = {
      ...database.members[memberIndex],
      username: createdMessage.username,
      lastActiveAt: createdMessage.createdAt
    };
  } else {
    database.members.push({
      id: createdMessage.memberId,
      serverId: createdMessage.serverId,
      username: createdMessage.username,
      roles: [],
      joinedAt: createdMessage.createdAt,
      lastActiveAt: createdMessage.createdAt
    });
  }

  if (database.messages.length > 200_000) {
    database.messages = database.messages.slice(-200_000);
  }

  saveDatabase(database);
  return createdMessage;
}

export function getServerSnapshot(serverId: string): { messages: MessageRecord[]; members: MemberRecord[] } {
  const database = readDatabase();

  return {
    messages: database.messages
      .filter((message) => message.serverId === serverId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    members: database.members
      .filter((member) => member.serverId === serverId)
      .sort((a, b) => a.username.localeCompare(b.username))
  };
}

export function listKnownServerIds(): string[] {
  const database = readDatabase();
  const serverIds = new Set<string>();

  for (const member of database.members) {
    serverIds.add(member.serverId);
  }

  for (const message of database.messages) {
    serverIds.add(message.serverId);
  }

  return [...serverIds].sort();
}

export function createCheckoutSession(serverId: string, email?: string): CheckoutSession {
  const database = readDatabase();

  const session: CheckoutSession = {
    token: randomUUID(),
    serverId,
    email,
    paid: false,
    createdAt: new Date().toISOString()
  };

  database.checkoutSessions.push(session);
  saveDatabase(database);

  return session;
}

export function markCheckoutPaid(input: {
  token?: string;
  serverId?: string;
  email?: string;
  lemonOrderId?: string;
  amount?: number;
  currency?: string;
}): PurchaseRecord | null {
  const database = readDatabase();
  const now = new Date().toISOString();

  let matchedSession: CheckoutSession | undefined;

  if (input.token) {
    matchedSession = database.checkoutSessions.find((session) => session.token === input.token);
  }

  const serverId = input.serverId ?? matchedSession?.serverId;
  if (!serverId) {
    return null;
  }

  if (matchedSession) {
    matchedSession.paid = true;
    matchedSession.paidAt = now;
    matchedSession.lemonOrderId = input.lemonOrderId;
    matchedSession.email = matchedSession.email ?? input.email;
  }

  const recordId = input.lemonOrderId ?? `manual-${randomUUID()}`;
  const existing = database.purchases.find((purchase) => purchase.id === recordId);

  const purchaseRecord: PurchaseRecord = existing ?? {
    id: recordId,
    serverId,
    token: input.token ?? matchedSession?.token,
    email: input.email ?? matchedSession?.email,
    amount: input.amount,
    currency: input.currency,
    status: "paid",
    createdAt: now
  };

  if (existing) {
    existing.status = "paid";
    existing.email = existing.email ?? purchaseRecord.email;
    existing.amount = existing.amount ?? input.amount;
    existing.currency = existing.currency ?? input.currency;
    existing.serverId = existing.serverId || serverId;
    existing.token = existing.token ?? input.token;
  } else {
    database.purchases.push(purchaseRecord);
  }

  saveDatabase(database);
  return purchaseRecord;
}

export function hasPaidAccess(serverId: string, token?: string): boolean {
  const database = readDatabase();

  if (token) {
    const session = database.checkoutSessions.find((checkout) => checkout.token === token);
    if (session && session.serverId === serverId && session.paid) {
      return true;
    }
  }

  return database.purchases.some((purchase) => purchase.serverId === serverId && purchase.status === "paid");
}

export function getRecentPurchaseForServer(serverId: string): PurchaseRecord | null {
  const database = readDatabase();
  const candidates = database.purchases
    .filter((purchase) => purchase.serverId === serverId && purchase.status === "paid")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return candidates[0] ?? null;
}
