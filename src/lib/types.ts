export type DiscordEventType = "message" | "member";

export interface DiscordMessageEvent {
  id: string;
  serverId: string;
  channelId: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export interface DiscordMemberEvent {
  id: string;
  serverId: string;
  memberId: string;
  memberName: string;
  event: "join" | "leave" | "presence";
  timestamp: string;
}

export interface DiscordEventStore {
  messages: DiscordMessageEvent[];
  members: DiscordMemberEvent[];
}

export interface PurchaseRecord {
  orderId: string;
  email: string;
  serverId: string;
  status: "paid" | "refunded" | "cancelled";
  createdAt: string;
  rawEventName: string;
}

export interface ContributorSummary {
  memberId: string;
  memberName: string;
  messages: number;
  words: number;
  lastActiveAt: string;
}

export interface TrendPoint {
  date: string;
  messages: number;
  activeMembers: number;
}

export interface ChurnPredictionRow {
  memberId: string;
  memberName: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  daysSinceLastMessage: number;
  recentMessages: number;
  previousPeriodMessages: number;
  reasons: string[];
}

export interface WordCloudItem {
  text: string;
  value: number;
}

export interface AnalyticsResponse {
  serverId: string;
  windowDays: number;
  summary: {
    totalMessages: number;
    activeMembers: number;
    avgMessagesPerActiveMember: number;
    messageGrowthVsPreviousWindow: number;
    atRiskMemberCount: number;
  };
  topContributors: ContributorSummary[];
  engagementTrend: TrendPoint[];
  churnPredictions: ChurnPredictionRow[];
  hotTopics: WordCloudItem[];
  generatedAt: string;
}
