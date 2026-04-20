import {
  format,
  isAfter,
  isWithinInterval,
  parseISO,
  startOfDay,
  subDays
} from "date-fns";
import type {
  ContributorMetric,
  EngagementTrendPoint,
  MemberRecord,
  MessageRecord,
  ServerAnalytics,
  ServerRecord,
  WordFrequency
} from "@/lib/types";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "this",
  "from",
  "have",
  "your",
  "just",
  "about",
  "into",
  "like",
  "what",
  "when",
  "then",
  "will",
  "they",
  "them",
  "their",
  "were",
  "there",
  "here",
  "you",
  "our",
  "out",
  "let",
  "can",
  "are",
  "new",
  "now",
  "but",
  "not",
  "use",
  "more",
  "need",
  "some",
  "also",
  "into",
  "after",
  "still",
  "very",
  "how",
  "why",
  "has",
  "had",
  "was",
  "its",
  "it's",
  "rt",
  "https",
  "http",
  "com",
  "discord"
]);

export function calculateMessageTrend(
  messages: MessageRecord[],
  days = 30
): EngagementTrendPoint[] {
  const end = new Date();
  const start = subDays(startOfDay(end), days - 1);
  const buckets = new Map<string, { messages: number; members: Set<string> }>();

  for (let offset = 0; offset < days; offset += 1) {
    const day = format(subDays(startOfDay(end), days - 1 - offset), "yyyy-MM-dd");
    buckets.set(day, { messages: 0, members: new Set() });
  }

  for (const message of messages) {
    const timestamp = parseISO(message.timestamp);
    if (
      !isWithinInterval(timestamp, {
        start,
        end
      })
    ) {
      continue;
    }

    const dayKey = format(timestamp, "yyyy-MM-dd");
    const bucket = buckets.get(dayKey);
    if (!bucket) {
      continue;
    }
    bucket.messages += 1;
    bucket.members.add(message.authorId);
  }

  return Array.from(buckets.entries()).map(([day, bucket]) => ({
    day,
    messages: bucket.messages,
    activeMembers: bucket.members.size
  }));
}

export function calculateTopContributors(
  messages: MessageRecord[],
  members: Record<string, MemberRecord>,
  days = 30,
  limit = 8
): ContributorMetric[] {
  const cutoff = subDays(new Date(), days);
  const stats = new Map<
    string,
    {
      count: number;
      channels: Set<string>;
      activeDays: Set<string>;
      lastActiveAt: string;
    }
  >();

  for (const message of messages) {
    const timestamp = parseISO(message.timestamp);
    if (!isAfter(timestamp, cutoff)) {
      continue;
    }

    const entry = stats.get(message.authorId) ?? {
      count: 0,
      channels: new Set<string>(),
      activeDays: new Set<string>(),
      lastActiveAt: message.timestamp
    };

    entry.count += 1;
    entry.channels.add(message.channelId);
    entry.activeDays.add(format(timestamp, "yyyy-MM-dd"));
    if (message.timestamp > entry.lastActiveAt) {
      entry.lastActiveAt = message.timestamp;
    }
    stats.set(message.authorId, entry);
  }

  const results = Array.from(stats.entries()).map(([memberId, entry]) => {
    const member = members[memberId];
    const engagementScore = Math.round(
      entry.count * 0.65 + entry.channels.size * 8 + entry.activeDays.size * 3
    );

    return {
      memberId,
      username: member?.username ?? memberId,
      messageCount: entry.count,
      activeDays: entry.activeDays.size,
      channelDiversity: entry.channels.size,
      engagementScore,
      lastActiveAt: entry.lastActiveAt
    } satisfies ContributorMetric;
  });

  return results
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, limit);
}

export function extractHotTopics(
  messages: MessageRecord[],
  days = 14,
  limit = 40
): WordFrequency[] {
  const cutoff = subDays(new Date(), days);
  const counts = new Map<string, number>();

  for (const message of messages) {
    const timestamp = parseISO(message.timestamp);
    if (!isAfter(timestamp, cutoff)) {
      continue;
    }

    const clean = message.content
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    for (const rawWord of clean.split(" ")) {
      if (!rawWord || rawWord.length < 3 || rawWord.length > 24) {
        continue;
      }
      if (STOP_WORDS.has(rawWord)) {
        continue;
      }
      const next = (counts.get(rawWord) ?? 0) + 1;
      counts.set(rawWord, next);
    }
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([text, value]) => ({ text, value }));
}

export function calculateServerAnalytics(server: ServerRecord): ServerAnalytics {
  const trend = calculateMessageTrend(server.messages, 30);
  const topContributors = calculateTopContributors(server.messages, server.members, 30, 8);
  const hotTopics = extractHotTopics(server.messages, 14, 45);
  const totalMessages30d = trend.reduce((sum, point) => sum + point.messages, 0);
  const activeMemberSet = new Set<string>();

  const cutoff = subDays(new Date(), 30);
  for (const message of server.messages) {
    if (isAfter(parseISO(message.timestamp), cutoff)) {
      activeMemberSet.add(message.authorId);
    }
  }

  return {
    serverId: server.id,
    serverName: server.name,
    totalMessages30d,
    activeMembers30d: activeMemberSet.size,
    averageMessagesPerDay: Math.round(totalMessages30d / 30),
    engagementTrend: trend,
    topContributors,
    hotTopics
  };
}
