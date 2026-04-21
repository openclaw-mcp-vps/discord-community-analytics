export interface RawMessage {
  messageId: string;
  serverId: string;
  channelId: string;
  memberId: string;
  username: string;
  content: string;
  wordCount: number;
  createdAt: string;
}

export interface RawMemberSnapshot {
  serverId: string;
  memberId: string;
  username: string;
  joinedAt: string | null;
  roles: string[];
  collectedAt: string;
}

export interface DailyEngagementPoint {
  date: string;
  messages: number;
  activeMembers: number;
}

export interface ContributorInsight {
  memberId: string;
  username: string;
  messageCount: number;
  wordCount: number;
  averageWordsPerMessage: number;
  lastMessageAt: string | null;
  engagementScore: number;
}

export type RiskBand = "low" | "medium" | "high";

export interface ChurnRiskRow {
  memberId: string;
  username: string;
  daysInactive: number;
  recentMessages: number;
  previousMessages: number;
  totalMessages30d: number;
  riskScore: number;
  riskBand: RiskBand;
  rationale: string;
}

export interface WordCloudToken {
  text: string;
  value: number;
}

export interface AnalyticsSnapshot {
  generatedAt: string;
  windowDays: number;
  totalMessages: number;
  activeMembers: number;
  topContributors: ContributorInsight[];
  engagementTrend: DailyEngagementPoint[];
  churnRisk: ChurnRiskRow[];
  topicCloud: WordCloudToken[];
}

export interface DiscordMessageWebhook {
  eventType: "message_batch";
  serverId: string;
  messages: Array<{
    messageId: string;
    channelId: string;
    memberId: string;
    username: string;
    content: string;
    createdAt: string;
  }>;
}

export interface DiscordMemberWebhook {
  eventType: "member_snapshot";
  serverId: string;
  members: Array<{
    memberId: string;
    username: string;
    joinedAt: string | null;
    roles: string[];
  }>;
  collectedAt?: string;
}

export type DiscordWebhookPayload = DiscordMessageWebhook | DiscordMemberWebhook;
