import { differenceInDays } from "date-fns";

import type { ChurnPredictionRow } from "@/lib/types";

interface MemberActivityInput {
  memberId: string;
  memberName: string;
  lastMessageAt: string;
  recentMessages: number;
  previousPeriodMessages: number;
  totalMessages: number;
  activeDays: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function calculateRiskLevel(score: number): ChurnPredictionRow["riskLevel"] {
  if (score >= 70) {
    return "high";
  }
  if (score >= 45) {
    return "medium";
  }
  return "low";
}

export function predictChurnRisk(members: MemberActivityInput[]): ChurnPredictionRow[] {
  const now = new Date();

  return members
    .map((member) => {
      const daysSinceLastMessage = differenceInDays(now, new Date(member.lastMessageAt));
      const changeRate =
        member.previousPeriodMessages === 0
          ? member.recentMessages > 0
            ? 1
            : 0
          : member.recentMessages / member.previousPeriodMessages;
      const consistency = clamp(member.activeDays / 30, 0, 1);

      const reasons: string[] = [];

      let score = 0;
      score += Math.min(daysSinceLastMessage * 5, 40);

      if (changeRate < 0.5) {
        score += 22;
        reasons.push("Message volume dropped by more than 50% versus prior week");
      }

      if (consistency < 0.25) {
        score += 18;
        reasons.push("Low day-to-day consistency over the last 30 days");
      }

      if (member.totalMessages < 8) {
        score += 15;
        reasons.push("Very low historical participation");
      }

      if (daysSinceLastMessage >= 7) {
        reasons.push("No message activity in at least 7 days");
      }

      score = clamp(score, 0, 100);

      return {
        memberId: member.memberId,
        memberName: member.memberName,
        riskScore: score,
        riskLevel: calculateRiskLevel(score),
        daysSinceLastMessage,
        recentMessages: member.recentMessages,
        previousPeriodMessages: member.previousPeriodMessages,
        reasons,
      } satisfies ChurnPredictionRow;
    })
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 25);
}
