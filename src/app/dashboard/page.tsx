import { Activity, AlertTriangle, MessageSquare, Users } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { buildServerAnalytics } from "@/lib/analytics";
import { getAccessCookieName, verifyAccessToken } from "@/lib/paywall";
import { ChurnPrediction } from "@/components/ChurnPrediction";
import { EngagementChart } from "@/components/EngagementChart";
import { TopContributors } from "@/components/TopContributors";
import { WordCloud } from "@/components/WordCloud";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{ days?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAccessCookieName())?.value;
  const access = verifyAccessToken(token);

  if (!access) {
    redirect("/");
  }

  const params = await searchParams;
  const daysInput = Number(params.days ?? 30);
  const days = Number.isFinite(daysInput) ? Math.min(Math.max(daysInput, 7), 90) : 30;

  const analytics = await buildServerAnalytics(access.serverId, days);

  return (
    <main className="min-h-screen bg-[#0d1117] px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6">
          <p className="text-sm uppercase tracking-widest text-[#79c0ff]">Engagement Intelligence</p>
          <h1 className="mt-2 text-3xl font-bold text-[#f0f6fc]">Server {analytics.serverId}</h1>
          <p className="mt-2 text-sm text-[#8b949e]">
            Window: last {analytics.windowDays} days. Generated {new Date(analytics.generatedAt).toLocaleString()}.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-[#8b949e]">
                <MessageSquare className="h-4 w-4 text-[#79c0ff]" />
                Total Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#f0f6fc]">{analytics.summary.totalMessages}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-[#8b949e]">
                <Users className="h-4 w-4 text-[#3fb950]" />
                Active Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#f0f6fc]">{analytics.summary.activeMembers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-[#8b949e]">
                <Activity className="h-4 w-4 text-[#e3b341]" />
                Growth vs Prior Window
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#f0f6fc]">{analytics.summary.messageGrowthVsPreviousWindow}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-[#8b949e]">
                <AlertTriangle className="h-4 w-4 text-[#ff7b72]" />
                At-Risk Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#f0f6fc]">{analytics.summary.atRiskMemberCount}</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <EngagementChart data={analytics.engagementTrend} />
          <TopContributors contributors={analytics.topContributors} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ChurnPrediction rows={analytics.churnPredictions} />
          <WordCloud words={analytics.hotTopics} />
        </section>
      </div>
    </main>
  );
}
