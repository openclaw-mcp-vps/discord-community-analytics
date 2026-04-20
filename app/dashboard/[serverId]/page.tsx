import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BarChart3, Flame, MessageSquareText, Users } from "lucide-react";
import { ChurnRiskList } from "@/components/ChurnRiskList";
import { EngagementChart } from "@/components/EngagementChart";
import { TopContributors } from "@/components/TopContributors";
import { WordCloud } from "@/components/WordCloud";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateChurnRisk } from "@/lib/analytics/churnPredictor";
import { calculateEngagement } from "@/lib/analytics/engagementCalculator";
import { getServerSnapshot } from "@/lib/database/models";
import { ACCESS_COOKIE_NAME, hasServerAccess } from "@/lib/paywall";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  params: Promise<{ serverId: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { serverId } = await params;
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!hasServerAccess(cookieValue, serverId)) {
    redirect(`/?locked=1&server=${serverId}`);
  }

  const { messages, members } = getServerSnapshot(serverId);
  const engagement = calculateEngagement(messages, members);
  const churn = calculateChurnRisk(members, messages);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-blue-300">Paid Analytics Workspace</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-100">Discord Server {serverId}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Retention-first analytics across contribution quality, participation momentum, and churn risk.
          </p>
        </div>
        <Link className="text-sm text-blue-300 underline-offset-4 hover:underline" href="/">
          Manage plan
        </Link>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#111926]">
          <CardHeader className="pb-2">
            <CardDescription>Messages (30d)</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageSquareText className="h-5 w-5 text-blue-300" />
              {engagement.summary.totalMessages30d}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-[#111926]">
          <CardHeader className="pb-2">
            <CardDescription>Active Members (30d)</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-5 w-5 text-emerald-300" />
              {engagement.summary.activeMembers30d}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-[#111926]">
          <CardHeader className="pb-2">
            <CardDescription>Avg messages/day</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BarChart3 className="h-5 w-5 text-indigo-300" />
              {engagement.summary.avgMessagesPerDay}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-[#111926]">
          <CardHeader className="pb-2">
            <CardDescription>Momentum</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Flame className="h-5 w-5 text-amber-300" />
              {engagement.summary.momentum.toUpperCase()}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-[#111926]">
          <CardHeader>
            <CardTitle>Message Frequency + Active Members</CardTitle>
            <CardDescription>14-day trend to detect momentum changes early.</CardDescription>
          </CardHeader>
          <CardContent>
            <EngagementChart data={engagement.trend} />
          </CardContent>
        </Card>

        <Card className="bg-[#111926]">
          <CardHeader>
            <CardTitle>Hot Topics Word Cloud</CardTitle>
            <CardDescription>Most repeated conversation themes from recent activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <WordCloud terms={engagement.wordCloud} />
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="bg-[#111926]">
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>Consistency-weighted leaderboard from the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <TopContributors contributors={engagement.topContributors} />
          </CardContent>
        </Card>

        <Card className="bg-[#111926]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Churn Risk Watchlist
              <Badge variant="danger">{churn.highRiskCount} high risk</Badge>
            </CardTitle>
            <CardDescription>Members with declining activity patterns that need intervention.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChurnRiskList members={churn.atRiskMembers} />
          </CardContent>
        </Card>
      </section>

      {messages.length === 0 ? (
        <section className="mt-6 rounded-xl border border-slate-800 bg-[#111926] p-5 text-sm text-slate-300">
          <p className="font-semibold text-slate-100">No data ingested yet.</p>
          <p className="mt-2">Connect your Discord bot webhook to start collecting messages and member activity.</p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-slate-200">
            {`POST /api/webhook/discord\n{
  "type": "message.created",
  "eventId": "evt_123",
  "serverId": "${serverId}",
  "channelId": "987654321",
  "memberId": "11223344",
  "username": "community-lead",
  "content": "Let's run a growth sprint this week.",
  "createdAt": "${new Date().toISOString()}"
}`}
          </pre>
        </section>
      ) : null}
    </main>
  );
}
