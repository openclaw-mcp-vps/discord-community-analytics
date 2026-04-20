import { differenceInDays, parseISO, subDays } from "date-fns";
import type {
  ChurnPrediction,
  MemberRecord,
  MessageRecord,
  RiskLevel
} from "@/lib/types";

interface MessageWindowStat {
  recent: number;
  previous: number;
  lastActiveAt: string | null;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) {
    return "high";
  }
  if (score >= 40) {
    return "medium";
  }
  return "low";
}

function buildWindowStats(messages: MessageRecord[]) {
  const recentCutoff = subDays(new Date(), 30);
  const previousCutoff = subDays(new Date(), 60);

  const stats = new Map<string, MessageWindowStat>();

  for (const message of messages) {
    const timestamp = parseISO(message.timestamp);
    const entry = stats.get(message.authorId) ?? {
      recent: 0,
      previous: 0,
      lastActiveAt: null
    };

    if (timestamp >= recentCutoff) {
      entry.recent += 1;
    } else if (timestamp >= previousCutoff) {
      entry.previous += 1;
    }

    if (!entry.lastActiveAt || message.timestamp > entry.lastActiveAt) {
      entry.lastActiveAt = message.timestamp;
    }

    stats.set(message.authorId, entry);
  }

  return stats;
}

export function predictChurnRisk(
  messages: MessageRecord[],
  members: Record<string, MemberRecord>
): ChurnPrediction[] {
  const stats = buildWindowStats(messages);
  const now = new Date();

  const predictions = Object.values(members).map((member) => {
    const memberStats = stats.get(member.id) ?? {
      recent: 0,
      previous: 0,
      lastActiveAt: member.lastSeenAt
    };

    const lastActiveAt = memberStats.lastActiveAt
      ? parseISO(memberStats.lastActiveAt)
      : parseISO(member.lastSeenAt);
    const daysInactive = clamp(differenceInDays(now, lastActiveAt), 0, 365);

    const trendDelta =
      memberStats.previous > 0
        ? Math.round(
            ((memberStats.recent - memberStats.previous) / memberStats.previous) *
              100
          )
        : memberStats.recent > 0
          ? 100
          : 0;

    const inactivityScore = clamp(daysInactive * 2.2, 0, 52);
    const trendPenalty =
      memberStats.previous > 0 && memberStats.recent < memberStats.previous
        ? clamp(
            ((memberStats.previous - memberStats.recent) /
              Math.max(memberStats.previous, 1)) *
              36,
            0,
            36
          )
        : 0;
    const lowVolumePenalty = memberStats.recent <= 4 ? 12 : memberStats.recent <= 12 ? 6 : 0;

    const joinedRecently = differenceInDays(now, parseISO(member.joinedAt)) < 14;
    const newMemberDiscount = joinedRecently ? 12 : 0;

    const riskScore = Math.round(
      clamp(inactivityScore + trendPenalty + lowVolumePenalty - newMemberDiscount, 0, 100)
    );

    return {
      memberId: member.id,
      username: member.username,
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      daysInactive,
      recentMessages: memberStats.recent,
      previousMessages: memberStats.previous,
      trendDelta
    } satisfies ChurnPrediction;
  });

  return predictions.sort((a, b) => b.riskScore - a.riskScore);
}

export function summarizeChurn(predictions: ChurnPrediction[]) {
  const high = predictions.filter((entry) => entry.riskLevel === "high").length;
  const medium = predictions.filter((entry) => entry.riskLevel === "medium").length;
  const low = predictions.filter((entry) => entry.riskLevel === "low").length;
  return {
    high,
    medium,
    low,
    averageScore:
      predictions.length > 0
        ? Math.round(
            predictions.reduce((sum, entry) => sum + entry.riskScore, 0) /
              predictions.length
          )
        : 0
  };
}
