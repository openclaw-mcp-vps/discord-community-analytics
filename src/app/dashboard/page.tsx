import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ChurnRiskTable } from "@/components/ChurnRiskTable";
import { EngagementChart } from "@/components/EngagementChart";
import { TopContributors } from "@/components/TopContributors";
import { WordCloud } from "@/components/WordCloud";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsSnapshot, seedDemoDataIfEmpty } from "@/lib/analytics";
import { getAccessCookieName, verifyAccessToken } from "@/lib/paywall";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(getAccessCookieName())?.value;
  const access = verifyAccessToken(accessToken);

  if (!access) {
    redirect("/purchase/activate?next=/dashboard");
  }

  seedDemoDataIfEmpty();
  const snapshot = getAnalyticsSnapshot();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Discord Community Analytics</h1>
          <p className="text-slate-400">
            Generated {new Date(snapshot.generatedAt).toLocaleString()} · 30-day intelligence window
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link href="/api/analytics">
            <Button variant="outline">Export JSON</Button>
          </Link>
        </div>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">Messages (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-100">{snapshot.totalMessages}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-100">{snapshot.activeMembers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">At-Risk Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-300">
              {snapshot.churnRisk.filter((row) => row.riskBand !== "low").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">Top Contributor Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-300">
              {snapshot.topContributors[0]?.engagementScore ?? 0}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Frequency Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <EngagementChart data={snapshot.engagementTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hot Topic Word Cloud (14d)</CardTitle>
          </CardHeader>
          <CardContent>
            <WordCloud words={snapshot.topicCloud} />
          </CardContent>
        </Card>
      </section>

      <section className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <TopContributors contributors={snapshot.topContributors} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Members At Risk of Churn</CardTitle>
          </CardHeader>
          <CardContent>
            <ChurnRiskTable rows={snapshot.churnRisk} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
