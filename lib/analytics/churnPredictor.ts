import { differenceInCalendarDays, parseISO, subDays } from "date-fns";
import type { ChurnRiskMember, MemberRecord, MessageRecord } from "@/lib/types";

export interface ChurnResult {
  highRiskCount: number;
  mediumRiskCount: number;
  atRiskMembers: ChurnRiskMember[];
}

function getMemberMessages(memberId: string, messages: MessageRecord[]): MessageRecord[] {
  return messages.filter((message) => message.memberId === memberId);
}

function classifyRisk(score: number): "low" | "medium" | "high" {
  if (score >= 70) {
    return "high";
  }

  if (score >= 45) {
    return "medium";
  }

  return "low";
}

export function calculateChurnRisk(members: MemberRecord[], messages: MessageRecord[]): ChurnResult {
  const now = new Date();
  const last7Cutoff = subDays(now, 7);
  const previous7Cutoff = subDays(now, 14);

  const scoredMembers: ChurnRiskMember[] = members.map((member) => {
    const memberMessages = getMemberMessages(member.id, messages);

    const latestMessageAt = memberMessages.length
      ? memberMessages.reduce(
          (latest, message) => (message.createdAt > latest ? message.createdAt : latest),
          memberMessages[0]?.createdAt ?? member.lastActiveAt
        )
      : member.lastActiveAt;

    const daysInactive = differenceInCalendarDays(now, parseISO(latestMessageAt));
    const messagesLast7 = memberMessages.filter((message) => parseISO(message.createdAt) >= last7Cutoff).length;
    const messagesPrevious7 = memberMessages.filter((message) => {
      const date = parseISO(message.createdAt);
      return date >= previous7Cutoff && date < last7Cutoff;
    }).length;

    const inactivityScore = Math.min(60, daysInactive * 6);
    const baseline = Math.max(messagesPrevious7, 1);
    const declineRatio = Math.max(0, (messagesPrevious7 - messagesLast7) / baseline);
    const declineScore = Math.round(declineRatio * 40);
    const riskScore = Math.min(100, inactivityScore + declineScore);
    const riskLevel = classifyRisk(riskScore);

    let reason = "Healthy participation pattern";
    if (riskLevel === "high") {
      reason =
        daysInactive > 7
          ? `${daysInactive} days inactive with sustained drop in contribution.`
          : "Steep activity drop over the last week compared to prior behavior.";
    } else if (riskLevel === "medium") {
      reason =
        daysInactive > 4
          ? `${daysInactive} days since last message and declining activity.`
          : "Noticeable week-over-week activity decline.";
    }

    return {
      memberId: member.id,
      username: member.username,
      riskScore,
      riskLevel,
      daysInactive,
      messagesLast7,
      messagesPrevious7,
      reason,
      lastActiveAt: latestMessageAt
    };
  });

  const atRiskMembers = scoredMembers
    .filter((member) => member.riskLevel !== "low")
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 25);

  return {
    highRiskCount: atRiskMembers.filter((member) => member.riskLevel === "high").length,
    mediumRiskCount: atRiskMembers.filter((member) => member.riskLevel === "medium").length,
    atRiskMembers
  };
}
