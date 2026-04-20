import { differenceInCalendarDays, format, parseISO, startOfDay, subDays } from "date-fns";
import type { DailyEngagementPoint, MemberRecord, MessageRecord, TopContributor, WordCloudTerm } from "@/lib/types";

const STOP_WORDS = new Set([
  "the",
  "and",
  "that",
  "with",
  "have",
  "this",
  "from",
  "your",
  "will",
  "just",
  "they",
  "them",
  "for",
  "are",
  "was",
  "were",
  "our",
  "about",
  "what",
  "when",
  "which",
  "into",
  "then",
  "than",
  "you",
  "can",
  "cant",
  "dont",
  "im",
  "its",
  "https",
  "discord",
  "server"
]);

export interface EngagementResult {
  topContributors: TopContributor[];
  trend: DailyEngagementPoint[];
  wordCloud: WordCloudTerm[];
  summary: {
    totalMessages30d: number;
    activeMembers30d: number;
    avgMessagesPerDay: number;
    momentum: "up" | "flat" | "down";
  };
}

function sanitizeWord(rawWord: string): string {
  return rawWord
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function calculateEngagement(messages: MessageRecord[], members: MemberRecord[]): EngagementResult {
  const now = new Date();
  const horizon = subDays(now, 30);
  const trendHorizon = subDays(now, 13);

  const recentMessages = messages.filter((message) => parseISO(message.createdAt) >= horizon);
  const messagesByMember = new Map<string, MessageRecord[]>();

  for (const message of recentMessages) {
    const bucket = messagesByMember.get(message.memberId) ?? [];
    bucket.push(message);
    messagesByMember.set(message.memberId, bucket);
  }

  const topContributors: TopContributor[] = [...messagesByMember.entries()]
    .map(([memberId, memberMessages]) => {
      const activeDays = new Set(memberMessages.map((entry) => startOfDay(parseISO(entry.createdAt)).toISOString())).size;
      const mostRecent = memberMessages.reduce(
        (latest, entry) => (entry.createdAt > latest ? entry.createdAt : latest),
        memberMessages[0]?.createdAt ?? null
      );
      const recencyBoost = mostRecent
        ? Math.max(0, 7 - differenceInCalendarDays(now, parseISO(mostRecent)))
        : 0;
      const engagementScore = memberMessages.length + activeDays * 2 + recencyBoost;
      const member = members.find((candidate) => candidate.id === memberId);

      return {
        memberId,
        username: member?.username ?? memberMessages[0]?.username ?? "Unknown member",
        messageCount: memberMessages.length,
        activeDays,
        engagementScore,
        lastActiveAt: mostRecent
      };
    })
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 12);

  const trend: DailyEngagementPoint[] = [];

  for (let offset = 13; offset >= 0; offset -= 1) {
    const date = subDays(now, offset);
    const dateKey = format(date, "yyyy-MM-dd");

    const dayMessages = messages.filter((message) => format(parseISO(message.createdAt), "yyyy-MM-dd") === dateKey);
    const activeMembers = new Set(dayMessages.map((message) => message.memberId)).size;

    trend.push({
      dateISO: dateKey,
      dateLabel: format(date, "MMM d"),
      messageCount: dayMessages.length,
      activeMembers
    });
  }

  const wordMap = new Map<string, number>();

  for (const message of recentMessages) {
    const words = message.content.split(/\s+/g).map(sanitizeWord);

    for (const word of words) {
      if (word.length < 3 || STOP_WORDS.has(word)) {
        continue;
      }

      wordMap.set(word, (wordMap.get(word) ?? 0) + 1);
    }
  }

  const wordCloud: WordCloudTerm[] = [...wordMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([text, value]) => ({ text, value }));

  const totalMessages30d = recentMessages.length;
  const activeMembers30d = new Set(recentMessages.map((message) => message.memberId)).size;
  const avgMessagesPerDay = Number((totalMessages30d / 30).toFixed(1));

  const firstWeek = trend.slice(0, 7).reduce((sum, item) => sum + item.messageCount, 0);
  const lastWeek = trend.slice(-7).reduce((sum, item) => sum + item.messageCount, 0);

  const momentum: EngagementResult["summary"]["momentum"] =
    lastWeek > firstWeek * 1.1 ? "up" : lastWeek < firstWeek * 0.9 ? "down" : "flat";

  return {
    topContributors,
    trend,
    wordCloud,
    summary: {
      totalMessages30d,
      activeMembers30d,
      avgMessagesPerDay,
      momentum
    }
  };
}
