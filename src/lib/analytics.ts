import "server-only";

import { format, parseISO, startOfDay, subDays } from "date-fns";

import { calculateChurnRisk } from "@/lib/churn-prediction";
import {
  fetchLatestMembers,
  fetchMessagesForWindow,
  getDb,
  insertMemberSnapshotBatch,
  insertMessageBatch
} from "@/lib/db";
import type {
  AnalyticsSnapshot,
  ContributorInsight,
  DailyEngagementPoint,
  RawMemberSnapshot,
  RawMessage,
  WordCloudToken
} from "@/lib/types";

const STOP_WORDS = new Set([
  "a",
  "about",
  "after",
  "all",
  "also",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "for",
  "from",
  "get",
  "had",
  "has",
  "have",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "just",
  "let",
  "like",
  "me",
  "more",
  "my",
  "need",
  "not",
  "of",
  "on",
  "or",
  "our",
  "out",
  "please",
  "so",
  "some",
  "that",
  "the",
  "their",
  "them",
  "there",
  "they",
  "this",
  "to",
  "up",
  "us",
  "was",
  "we",
  "what",
  "when",
  "which",
  "will",
  "with",
  "you",
  "your"
]);

function getWordCount(content: string) {
  return content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function buildContributors(messages: RawMessage[]): ContributorInsight[] {
  const memberMap = new Map<string, ContributorInsight>();

  for (const message of messages) {
    const messageDate = parseISO(message.createdAt);
    const existing = memberMap.get(message.memberId);

    if (!existing) {
      memberMap.set(message.memberId, {
        memberId: message.memberId,
        username: message.username,
        messageCount: 1,
        wordCount: message.wordCount,
        averageWordsPerMessage: message.wordCount,
        lastMessageAt: message.createdAt,
        engagementScore: 0
      });
      continue;
    }

    existing.messageCount += 1;
    existing.wordCount += message.wordCount;

    if (!existing.lastMessageAt || messageDate > parseISO(existing.lastMessageAt)) {
      existing.lastMessageAt = message.createdAt;
      existing.username = message.username;
    }
  }

  const now = new Date();

  const contributors = [...memberMap.values()].map((item) => {
    const averageWordsPerMessage =
      item.messageCount > 0 ? item.wordCount / item.messageCount : 0;

    const recencyBonus = item.lastMessageAt
      ? Math.max(0, 20 - (now.getTime() - parseISO(item.lastMessageAt).getTime()) / 86400000)
      : 0;

    const engagementScore = Number(
      (item.messageCount * 1.5 + item.wordCount * 0.1 + recencyBonus).toFixed(1)
    );

    return {
      ...item,
      averageWordsPerMessage: Number(averageWordsPerMessage.toFixed(1)),
      engagementScore
    };
  });

  return contributors
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 12);
}

function buildEngagementTrend(messages: RawMessage[], windowDays: number) {
  const today = startOfDay(new Date());

  const daily = new Map<string, { messages: number; members: Set<string> }>();

  for (let i = 0; i < windowDays; i += 1) {
    const day = subDays(today, windowDays - i - 1);
    const key = format(day, "yyyy-MM-dd");
    daily.set(key, { messages: 0, members: new Set<string>() });
  }

  for (const message of messages) {
    const dayKey = format(parseISO(message.createdAt), "yyyy-MM-dd");
    const bucket = daily.get(dayKey);

    if (!bucket) {
      continue;
    }

    bucket.messages += 1;
    bucket.members.add(message.memberId);
  }

  return [...daily.entries()].map(([date, data]) => ({
    date,
    messages: data.messages,
    activeMembers: data.members.size
  })) satisfies DailyEngagementPoint[];
}

function buildTopicCloud(messages: RawMessage[]) {
  const counts = new Map<string, number>();

  for (const message of messages) {
    const tokens = message.content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));

    for (const token of tokens) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 70)
    .map(([text, value]) => ({
      text,
      value
    })) satisfies WordCloudToken[];
}

export function normalizeIncomingMessages(
  serverId: string,
  messages: Array<{
    messageId: string;
    channelId: string;
    memberId: string;
    username: string;
    content: string;
    createdAt: string;
  }>
): RawMessage[] {
  return messages
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({
      messageId: message.messageId,
      serverId,
      channelId: message.channelId,
      memberId: message.memberId,
      username: message.username,
      content: message.content.slice(0, 2000),
      createdAt: message.createdAt,
      wordCount: getWordCount(message.content)
    }));
}

export function normalizeIncomingMembers(
  serverId: string,
  collectedAt: string,
  members: Array<{
    memberId: string;
    username: string;
    joinedAt: string | null;
    roles: string[];
  }>
): RawMemberSnapshot[] {
  return members.map((member) => ({
    serverId,
    memberId: member.memberId,
    username: member.username,
    joinedAt: member.joinedAt,
    roles: member.roles,
    collectedAt
  }));
}

export function storeMessageBatch(messages: RawMessage[]) {
  insertMessageBatch(messages);
}

export function storeMemberSnapshot(members: RawMemberSnapshot[]) {
  insertMemberSnapshotBatch(members);
}

export function getAnalyticsSnapshot(serverId?: string): AnalyticsSnapshot {
  const windowDays = 30;
  const windowStart = subDays(new Date(), windowDays);
  const messages = fetchMessagesForWindow(windowStart.toISOString(), serverId);
  const members = fetchLatestMembers(serverId);

  const topContributors = buildContributors(messages);
  const engagementTrend = buildEngagementTrend(messages, windowDays);
  const churnRisk = calculateChurnRisk(members, messages);
  const topicWindowStart = subDays(new Date(), 14);

  const topicCloud = buildTopicCloud(
    messages.filter((message) => parseISO(message.createdAt) >= topicWindowStart)
  );

  const activeMembers = new Set(messages.map((message) => message.memberId));

  return {
    generatedAt: new Date().toISOString(),
    windowDays,
    totalMessages: messages.length,
    activeMembers: activeMembers.size,
    topContributors,
    engagementTrend,
    churnRisk,
    topicCloud
  };
}

export function seedDemoDataIfEmpty() {
  const db = getDb();
  const row = db
    .prepare("SELECT COUNT(1) AS totalMessages FROM discord_messages")
    .get() as { totalMessages: number };

  if (row.totalMessages > 0) {
    return;
  }

  const now = new Date();
  const usernames = [
    "Alex",
    "Noah",
    "Maya",
    "Jordan",
    "Priya",
    "Carter",
    "Sam",
    "Quinn",
    "Robin",
    "Taylor"
  ];

  const members: RawMemberSnapshot[] = usernames.map((username, idx) => ({
    serverId: "demo-server",
    memberId: `member-${idx + 1}`,
    username,
    joinedAt: subDays(now, 90 - idx * 4).toISOString(),
    roles: idx < 3 ? ["Moderator"] : ["Member"],
    collectedAt: now.toISOString()
  }));

  const topics = [
    "onboarding",
    "events",
    "feedback",
    "integrations",
    "release",
    "support",
    "bot",
    "strategy",
    "community",
    "guides"
  ];

  const messages: RawMessage[] = [];

  for (let dayOffset = 29; dayOffset >= 0; dayOffset -= 1) {
    const day = subDays(now, dayOffset);
    const dailyMessages = Math.max(18, 95 - dayOffset * 2);

    for (let i = 0; i < dailyMessages; i += 1) {
      const memberIndex = i % usernames.length;
      const topic = topics[(i + dayOffset) % topics.length];
      const content = `${topics[(i + 1) % topics.length]} ${topic} update for weekly community goals`;
      const createdAt = new Date(day.getTime() + i * 600000).toISOString();
      messages.push({
        messageId: `demo-${dayOffset}-${i}`,
        serverId: "demo-server",
        channelId: `channel-${(i % 4) + 1}`,
        memberId: `member-${memberIndex + 1}`,
        username: usernames[memberIndex],
        content,
        wordCount: getWordCount(content),
        createdAt
      });
    }
  }

  insertMemberSnapshotBatch(members);
  insertMessageBatch(messages);
}
