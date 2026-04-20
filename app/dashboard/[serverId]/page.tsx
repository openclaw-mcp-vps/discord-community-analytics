import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import EngagementChart from "@/components/EngagementChart";
import TopContributors from "@/components/TopContributors";
import ChurnRiskTable from "@/components/ChurnRiskTable";
import WordCloud from "@/components/WordCloud";
import CheckoutButton from "@/components/CheckoutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { calculateServerAnalytics } from "@/lib/analytics/engagementCalculator";
import { predictChurnRisk, summarizeChurn } from "@/lib/analytics/churnPredictor";
import { getServer } from "@/lib/database/models";
import { verifyPaywallToken } from "@/lib/paywall/session";

interface DashboardPageProps {
  params: Promise<{ serverId: string }>;
}

function PaywallLocked({ serverId }: { serverId: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Access Requires an Active Subscription</CardTitle>
          <CardDescription>
            This workspace is paywalled at $19/month per server. Complete checkout and activate
            your purchase to unlock engagement + churn analytics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300">
          <p>
            You are trying to access server ID <code>{serverId}</code>. If you already paid, use
            the unlock page and provide your order ID.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <CheckoutButton serverId={serverId} className="w-full sm:w-auto" />
            <Link href={`/paywall/confirm?server=${encodeURIComponent(serverId)}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Activate existing purchase
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            Access token is stored as an HTTP-only cookie after purchase validation.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { serverId } = await params;
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("dca_paid")?.value;

  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ?? "local-dev-secret";
  const session = verifyPaywallToken(rawToken, secret, serverId);

  if (!session) {
    return <PaywallLocked serverId={serverId} />;
  }

  const server = getServer(serverId);
  if (!server) {
    notFound();
  }

  const analytics = calculateServerAnalytics(server);
  const churnPredictions = predictChurnRisk(server.messages, server.members);
  const churnSummary = summarizeChurn(churnPredictions);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-100">{analytics.serverName}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Engagement + churn intelligence for server <code>{analytics.serverId}</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">Paid Access</Badge>
          <Link href="/">
            <Button variant="outline">Back to landing</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Messages (30d)</CardDescription>
            <CardTitle className="text-3xl">{analytics.totalMessages30d}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Members (30d)</CardDescription>
            <CardTitle className="text-3xl">{analytics.activeMembers30d}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Messages / Day</CardDescription>
            <CardTitle className="text-3xl">{analytics.averageMessagesPerDay}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Churn Risk</CardDescription>
            <CardTitle className="text-3xl">{churnSummary.averageScore}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Message Frequency Trend</CardTitle>
            <CardDescription>
              Daily conversation volume over the last 30 days to detect momentum shifts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EngagementChart data={analytics.engagementTrend} />
          </CardContent>
        </Card>
        <TopContributors contributors={analytics.topContributors} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>At-Risk Members</CardTitle>
            <CardDescription>
              Start with high-risk members for proactive check-ins and role-specific reactivation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="danger">High: {churnSummary.high}</Badge>
              <Badge variant="warning">Medium: {churnSummary.medium}</Badge>
              <Badge variant="success">Low: {churnSummary.low}</Badge>
            </div>
            <ChurnRiskTable predictions={churnPredictions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hot Topics</CardTitle>
            <CardDescription>
              Word cloud from recent chat to show what the community is discussing now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WordCloud words={analytics.hotTopics} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
