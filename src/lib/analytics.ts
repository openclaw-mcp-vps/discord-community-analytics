import { format, isAfter, startOfDay, subDays } from "date-fns";

import { predictChurnRisk } from "@/lib/churn-predictor";
import { readDiscordEventStore } from "@/lib/storage";
import type {
  AnalyticsResponse,
  ContributorSummary,
  DiscordMessageEvent,
  TrendPoint,
  WordCloudItem,
} from "@/lib/types";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "this",
  "with",
  "you",
  "your",
  "from",
  "have",
  "just",
  "they",
  "them",
  "what",
  "when",
  "were",
  "will",
  "about",
  "into",
  "there",
  "would",
  "could",
  "should",
  "https",
  "discord",
  "server",
  "channel",
  "also",
  "been",
  "dont",
  "cant",
  "ive",
  "its",
  "our",
  "are",
  "was",
  "but",
  "all",
  "any",
  "out",
  "new",
]);

function tokenize(content: string): string[] {
  return content
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/<a?:\w+:\d+>/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function groupTrend(messages: DiscordMessageEvent[], days: number): TrendPoint[] {
  const today = startOfDay(new Date());
  const map = new Map<string, { count: number; members: Set<string> }>();

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = format(subDays(today, i), "yyyy-MM-dd");
    map.set(date, { count: 0, members: new Set() });
  }

  for (const message of messages) {
    const key = format(new Date(message.timestamp), "yyyy-MM-dd");
    const bucket = map.get(key);
    if (!bucket) {
      continue;
    }
    bucket.count += 1;
    bucket.members.add(message.authorId);
  }

  return Array.from(map.entries()).map(([date, stats]) => ({
    date,
    messages: stats.count,
    activeMembers: stats.members.size,
  }));
}

function summarizeContributors(messages: DiscordMessageEvent[]): ContributorSummary[] {
  const contributors = new Map<
    string,
    { memberName: string; messages: number; words: number; lastActiveAt: string }
  >();

  for (const message of messages) {
    const existing = contributors.get(message.authorId) ?? {
      memberName: message.authorName,
      messages: 0,
      words: 0,
      lastActiveAt: message.timestamp,
    };

    existing.memberName = message.authorName;
    existing.messages += 1;
    existing.words += tokenize(message.content).length;

    if (new Date(message.timestamp) > new Date(existing.lastActiveAt)) {
      existing.lastActiveAt = message.timestamp;
    }

    contributors.set(message.authorId, existing);
  }

  return Array.from(contributors.entries())
    .map(([memberId, value]) => ({ memberId, ...value }))
    .sort((a, b) => b.messages - a.messages)
    .slice(0, 15);
}

function computeHotTopics(messages: DiscordMessageEvent[]): WordCloudItem[] {
  const topics = new Map<string, number>();

  for (const message of messages) {
    for (const token of tokenize(message.content)) {
      topics.set(token, (topics.get(token) ?? 0) + 1);
    }
  }

  return Array.from(topics.entries())
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60)
    .map(([text, value]) => ({ text, value }));
}

function growthPercentage(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export async function buildServerAnalytics(serverId: string, windowDays = 30): Promise<AnalyticsResponse> {
  const store = await readDiscordEventStore();
  const now = new Date();
  const fromDate = subDays(now, windowDays);
  const previousFromDate = subDays(fromDate, windowDays);

  const currentMessages = store.messages.filter(
    (message) => message.serverId === serverId && isAfter(new Date(message.timestamp), fromDate)
  );

  const previousMessages = store.messages.filter(
    (message) =>
      message.serverId === serverId &&
      isAfter(new Date(message.timestamp), previousFromDate) &&
      !isAfter(new Date(message.timestamp), fromDate)
  );

  const contributors = summarizeContributors(currentMessages);
  const engagementTrend = groupTrend(currentMessages, windowDays);
  const hotTopics = computeHotTopics(currentMessages);

  const byMember = new Map<
    string,
    {
      memberName: string;
      lastMessageAt: string;
      recentMessages: number;
      previousPeriodMessages: number;
      totalMessages: number;
      days: Set<string>;
    }
  >();

  for (const message of currentMessages) {
    const existing = byMember.get(message.authorId) ?? {
      memberName: message.authorName,
      lastMessageAt: message.timestamp,
      recentMessages: 0,
      previousPeriodMessages: 0,
      totalMessages: 0,
      days: new Set<string>(),
    };

    existing.memberName = message.authorName;
    existing.recentMessages += 1;
    existing.totalMessages += 1;
    existing.days.add(format(new Date(message.timestamp), "yyyy-MM-dd"));

    if (new Date(message.timestamp) > new Date(existing.lastMessageAt)) {
      existing.lastMessageAt = message.timestamp;
    }

    byMember.set(message.authorId, existing);
  }

  for (const message of previousMessages) {
    const existing = byMember.get(message.authorId);
    if (!existing) {
      continue;
    }
    existing.previousPeriodMessages += 1;
    existing.totalMessages += 1;
  }

  const churnPredictions = predictChurnRisk(
    Array.from(byMember.entries()).map(([memberId, member]) => ({
      memberId,
      memberName: member.memberName,
      lastMessageAt: member.lastMessageAt,
      recentMessages: member.recentMessages,
      previousPeriodMessages: member.previousPeriodMessages,
      totalMessages: member.totalMessages,
      activeDays: member.days.size,
    }))
  );

  const activeMembers = new Set(currentMessages.map((message) => message.authorId)).size;
  const atRiskMemberCount = churnPredictions.filter((row) => row.riskLevel !== "low").length;

  return {
    serverId,
    windowDays,
    summary: {
      totalMessages: currentMessages.length,
      activeMembers,
      avgMessagesPerActiveMember: activeMembers
        ? Number((currentMessages.length / activeMembers).toFixed(1))
        : 0,
      messageGrowthVsPreviousWindow: growthPercentage(currentMessages.length, previousMessages.length),
      atRiskMemberCount,
    },
    topContributors: contributors,
    engagementTrend,
    churnPredictions,
    hotTopics,
    generatedAt: now.toISOString(),
  };
}
