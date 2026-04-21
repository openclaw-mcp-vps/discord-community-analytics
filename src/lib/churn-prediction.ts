import { differenceInCalendarDays, parseISO, subDays } from "date-fns";

import type { ChurnRiskRow, RawMemberSnapshot, RawMessage } from "@/lib/types";

interface MemberUsage {
  memberId: string;
  username: string;
  lastMessageAt: Date | null;
  recentMessages: number;
  previousMessages: number;
  totalMessages30d: number;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getRiskBand(score: number): ChurnRiskRow["riskBand"] {
  if (score >= 70) {
    return "high";
  }

  if (score >= 40) {
    return "medium";
  }

  return "low";
}

function buildRationale(
  daysInactive: number,
  recentMessages: number,
  previousMessages: number,
  riskBand: ChurnRiskRow["riskBand"]
) {
  if (riskBand === "high") {
    if (daysInactive >= 14) {
      return "No activity for 2+ weeks and engagement has stalled.";
    }

    if (previousMessages > 0 && recentMessages === 0) {
      return "Sharp drop to zero recent messages after prior activity.";
    }

    return "Sustained decline in posting activity in the last week.";
  }

  if (riskBand === "medium") {
    if (recentMessages < previousMessages) {
      return "Message pace is slowing compared with the prior week.";
    }

    return "Light recent participation; recommend proactive outreach.";
  }

  return "Healthy participation trend with recent community activity.";
}

export function calculateChurnRisk(
  members: RawMemberSnapshot[],
  messages: RawMessage[],
  now = new Date()
): ChurnRiskRow[] {
  const last7Start = subDays(now, 7);
  const prev7Start = subDays(now, 14);

  const usageByMember = new Map<string, MemberUsage>();

  for (const member of members) {
    usageByMember.set(member.memberId, {
      memberId: member.memberId,
      username: member.username,
      lastMessageAt: null,
      recentMessages: 0,
      previousMessages: 0,
      totalMessages30d: 0
    });
  }

  for (const message of messages) {
    const messageDate = parseISO(message.createdAt);
    const existing = usageByMember.get(message.memberId);

    const record: MemberUsage = existing ?? {
      memberId: message.memberId,
      username: message.username,
      lastMessageAt: null,
      recentMessages: 0,
      previousMessages: 0,
      totalMessages30d: 0
    };

    if (!record.lastMessageAt || messageDate > record.lastMessageAt) {
      record.lastMessageAt = messageDate;
    }

    record.totalMessages30d += 1;

    if (messageDate >= last7Start) {
      record.recentMessages += 1;
    } else if (messageDate >= prev7Start) {
      record.previousMessages += 1;
    }

    usageByMember.set(message.memberId, record);
  }

  const rows: ChurnRiskRow[] = [];

  for (const member of usageByMember.values()) {
    const daysInactive = member.lastMessageAt
      ? Math.max(0, differenceInCalendarDays(now, member.lastMessageAt))
      : 30;

    const inactivityPenalty = Math.min(60, daysInactive * 3.4);

    let trendPenalty = 0;
    if (member.previousMessages > 0 && member.recentMessages < member.previousMessages) {
      trendPenalty =
        ((member.previousMessages - member.recentMessages) / member.previousMessages) * 28;
    } else if (member.previousMessages === 0 && member.recentMessages === 0) {
      trendPenalty = 18;
    }

    const lowVolumePenalty = member.totalMessages30d < 3 ? 15 : 0;

    const score = clampScore(inactivityPenalty + trendPenalty + lowVolumePenalty);
    const riskBand = getRiskBand(score);

    rows.push({
      memberId: member.memberId,
      username: member.username,
      daysInactive,
      recentMessages: member.recentMessages,
      previousMessages: member.previousMessages,
      totalMessages30d: member.totalMessages30d,
      riskScore: score,
      riskBand,
      rationale: buildRationale(
        daysInactive,
        member.recentMessages,
        member.previousMessages,
        riskBand
      )
    });
  }

  return rows.sort((a, b) => b.riskScore - a.riskScore).slice(0, 25);
}
