import "server-only";

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

import type { RawMemberSnapshot, RawMessage } from "@/lib/types";

type PurchaseStatus = "active" | "revoked";

type GlobalWithDb = typeof globalThis & {
  __discordAnalyticsDb?: Database.Database;
};

const globalDb = globalThis as GlobalWithDb;

function initDb(db: Database.Database) {
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS discord_messages (
      message_id TEXT PRIMARY KEY,
      server_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      member_id TEXT NOT NULL,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      word_count INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS discord_member_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id TEXT NOT NULL,
      member_id TEXT NOT NULL,
      username TEXT NOT NULL,
      joined_at TEXT,
      roles_json TEXT NOT NULL,
      collected_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_messages_server_created
      ON discord_messages (server_id, created_at);

    CREATE INDEX IF NOT EXISTS idx_messages_member_created
      ON discord_messages (member_id, created_at);

    CREATE INDEX IF NOT EXISTS idx_member_snapshots_server_collected
      ON discord_member_snapshots (server_id, collected_at);

    CREATE TABLE IF NOT EXISTS purchase_entitlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      source TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export function getDb() {
  if (globalDb.__discordAnalyticsDb) {
    return globalDb.__discordAnalyticsDb;
  }

  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const dbPath = path.join(dataDir, "discord-community-analytics.db");
  const db = new Database(dbPath);
  initDb(db);

  globalDb.__discordAnalyticsDb = db;
  return db;
}

export function insertMessageBatch(messages: RawMessage[]) {
  if (messages.length === 0) {
    return;
  }

  const db = getDb();

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO discord_messages (
      message_id,
      server_id,
      channel_id,
      member_id,
      username,
      content,
      word_count,
      created_at
    ) VALUES (
      @messageId,
      @serverId,
      @channelId,
      @memberId,
      @username,
      @content,
      @wordCount,
      @createdAt
    )
  `);

  const tx = db.transaction((rows: RawMessage[]) => {
    for (const row of rows) {
      stmt.run(row);
    }
  });

  tx(messages);
}

export function insertMemberSnapshotBatch(members: RawMemberSnapshot[]) {
  if (members.length === 0) {
    return;
  }

  const db = getDb();

  const stmt = db.prepare(`
    INSERT INTO discord_member_snapshots (
      server_id,
      member_id,
      username,
      joined_at,
      roles_json,
      collected_at
    ) VALUES (
      @serverId,
      @memberId,
      @username,
      @joinedAt,
      @rolesJson,
      @collectedAt
    )
  `);

  const tx = db.transaction((rows: RawMemberSnapshot[]) => {
    for (const row of rows) {
      stmt.run({
        serverId: row.serverId,
        memberId: row.memberId,
        username: row.username,
        joinedAt: row.joinedAt,
        rolesJson: JSON.stringify(row.roles),
        collectedAt: row.collectedAt
      });
    }
  });

  tx(members);
}

export function fetchMessagesForWindow(windowStartIso: string, serverId?: string) {
  const db = getDb();

  if (serverId) {
    return db
      .prepare(
        `
          SELECT
            message_id as messageId,
            server_id as serverId,
            channel_id as channelId,
            member_id as memberId,
            username,
            content,
            word_count as wordCount,
            created_at as createdAt
          FROM discord_messages
          WHERE created_at >= ? AND server_id = ?
          ORDER BY created_at ASC
        `
      )
      .all(windowStartIso, serverId) as RawMessage[];
  }

  return db
    .prepare(
      `
        SELECT
          message_id as messageId,
          server_id as serverId,
          channel_id as channelId,
          member_id as memberId,
          username,
          content,
          word_count as wordCount,
          created_at as createdAt
        FROM discord_messages
        WHERE created_at >= ?
        ORDER BY created_at ASC
      `
    )
    .all(windowStartIso) as RawMessage[];
}

export function fetchLatestMembers(serverId?: string) {
  const db = getDb();

  const latestCollectedAt = serverId
    ? db
        .prepare(
          "SELECT MAX(collected_at) AS latestCollectedAt FROM discord_member_snapshots WHERE server_id = ?"
        )
        .get(serverId)
    : db
        .prepare("SELECT MAX(collected_at) AS latestCollectedAt FROM discord_member_snapshots")
        .get();

  const latest = (latestCollectedAt as { latestCollectedAt?: string | null })
    .latestCollectedAt;

  if (!latest) {
    return [] as RawMemberSnapshot[];
  }

  const rows = serverId
    ? db
        .prepare(
          `
            SELECT
              server_id as serverId,
              member_id as memberId,
              username,
              joined_at as joinedAt,
              roles_json as rolesJson,
              collected_at as collectedAt
            FROM discord_member_snapshots
            WHERE collected_at = ? AND server_id = ?
          `
        )
        .all(latest, serverId)
    : db
        .prepare(
          `
            SELECT
              server_id as serverId,
              member_id as memberId,
              username,
              joined_at as joinedAt,
              roles_json as rolesJson,
              collected_at as collectedAt
            FROM discord_member_snapshots
            WHERE collected_at = ?
          `
        )
        .all(latest);

  return (rows as Array<
    Omit<RawMemberSnapshot, "roles"> & {
      rolesJson: string;
    }
  >).map((row) => ({
    serverId: row.serverId,
    memberId: row.memberId,
    username: row.username,
    joinedAt: row.joinedAt,
    roles: JSON.parse(row.rolesJson) as string[],
    collectedAt: row.collectedAt
  }));
}

export function upsertPurchaseEntitlement(
  email: string,
  status: PurchaseStatus,
  source: string
) {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();

  db.prepare(
    `
      INSERT INTO purchase_entitlements (
        email,
        status,
        source,
        updated_at
      ) VALUES (?, ?, ?, ?)
      ON CONFLICT(email)
      DO UPDATE SET
        status = excluded.status,
        source = excluded.source,
        updated_at = excluded.updated_at
    `
  ).run(normalizedEmail, status, source, new Date().toISOString());
}

export function getPurchaseEntitlement(email: string) {
  const db = getDb();

  return db
    .prepare(
      `
        SELECT
          email,
          status,
          source,
          updated_at as updatedAt
        FROM purchase_entitlements
        WHERE email = ?
      `
    )
    .get(email.trim().toLowerCase()) as
    | {
        email: string;
        status: PurchaseStatus;
        source: string;
        updatedAt: string;
      }
    | undefined;
}
