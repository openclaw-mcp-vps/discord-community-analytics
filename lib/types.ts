export type RiskLevel = "low" | "medium" | "high";

export interface MessageRecord {
  id: string;
  serverId: string;
  serverName: string;
  channelId: string;
  channelName: string;
  authorId: string;
  authorUsername: string;
  content: string;
  timestamp: string;
}

export interface MemberRecord {
  id: string;
  username: string;
  joinedAt: string;
  lastSeenAt: string;
  messageCount: number;
  roles: string[];
}

export interface ServerRecord {
  id: string;
  name: string;
  messages: MessageRecord[];
  members: Record<string, MemberRecord>;
  updatedAt: string;
}

export interface PurchaseRecord {
  orderId: string;
  email: string;
  serverId: string;
  status: "paid" | "pending" | "refunded";
  productId: string;
  updatedAt: string;
  customerName?: string;
}

export interface DataStore {
  servers: Record<string, ServerRecord>;
  purchases: PurchaseRecord[];
}

export interface EngagementTrendPoint {
  day: string;
  messages: number;
  activeMembers: number;
}

export interface ContributorMetric {
  memberId: string;
  username: string;
  messageCount: number;
  activeDays: number;
  channelDiversity: number;
  engagementScore: number;
  lastActiveAt: string;
}

export interface WordFrequency {
  text: string;
  value: number;
}

export interface ChurnPrediction {
  memberId: string;
  username: string;
  riskScore: number;
  riskLevel: RiskLevel;
  daysInactive: number;
  recentMessages: number;
  previousMessages: number;
  trendDelta: number;
}

export interface ServerAnalytics {
  serverId: string;
  serverName: string;
  totalMessages30d: number;
  activeMembers30d: number;
  averageMessagesPerDay: number;
  engagementTrend: EngagementTrendPoint[];
  topContributors: ContributorMetric[];
  hotTopics: WordFrequency[];
}
