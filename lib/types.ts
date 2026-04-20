export interface MessageRecord {
  id: string;
  serverId: string;
  channelId: string;
  memberId: string;
  username: string;
  content: string;
  createdAt: string;
}

export interface MemberRecord {
  id: string;
  serverId: string;
  username: string;
  joinedAt: string;
  roles: string[];
  avatarUrl?: string;
  lastActiveAt: string;
}

export interface CheckoutSession {
  token: string;
  serverId: string;
  email?: string;
  paid: boolean;
  createdAt: string;
  paidAt?: string;
  lemonOrderId?: string;
}

export interface PurchaseRecord {
  id: string;
  serverId: string;
  token?: string;
  email?: string;
  amount?: number;
  currency?: string;
  status: "paid" | "refunded" | "cancelled";
  createdAt: string;
}

export interface WebhookEventRecord {
  id: string;
  source: "discord" | "lemonsqueezy";
  receivedAt: string;
}

export interface DatabaseSchema {
  messages: MessageRecord[];
  members: MemberRecord[];
  checkoutSessions: CheckoutSession[];
  purchases: PurchaseRecord[];
  webhookEvents: WebhookEventRecord[];
}

export interface TopContributor {
  memberId: string;
  username: string;
  messageCount: number;
  activeDays: number;
  engagementScore: number;
  lastActiveAt: string | null;
}

export interface DailyEngagementPoint {
  dateISO: string;
  dateLabel: string;
  messageCount: number;
  activeMembers: number;
}

export interface WordCloudTerm {
  text: string;
  value: number;
}

export interface ChurnRiskMember {
  memberId: string;
  username: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  daysInactive: number;
  messagesLast7: number;
  messagesPrevious7: number;
  reason: string;
  lastActiveAt: string | null;
}
