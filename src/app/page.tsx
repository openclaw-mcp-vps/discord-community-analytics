import Link from "next/link";

import { LemonCheckoutCard } from "@/components/LemonCheckoutCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="section-grid min-h-screen px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-16">
        <section className="fade-up grid gap-8 rounded-2xl border border-[#30363d] bg-[#0d1117]/85 p-8 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <Badge variant="default" className="w-fit">
              Discord Community Analytics
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-5xl">
              Know which members drive engagement and predict churn before they disappear.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[#8b949e] sm:text-lg">
              Most Discord dashboards stop at message counts. This platform tracks contributor momentum, topic gravity,
              and early churn signals so community managers can intervene while members are still reachable.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="#pricing">Get Access</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
            </div>
          </div>
          <div className="fade-up-delay rounded-2xl border border-[#30363d] bg-[#161b22] p-5">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#79c0ff]">What you can spot fast</p>
            <ul className="space-y-3 text-sm text-[#c9d1d9]">
              <li>Contributor drop-offs after launches and community events</li>
              <li>Channels where messages grow but unique participation shrinks</li>
              <li>Members showing sudden weekly activity decline and risk of churn</li>
              <li>Emerging topics that attract repeat participation</li>
            </ul>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>The Problem</CardTitle>
              <CardDescription>Admins are flying blind on community health.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-[#8b949e]">
              Raw counts hide the real question: who sustains conversations and who is quietly disengaging.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>The Solution</CardTitle>
              <CardDescription>Retention-first analytics with behavior modeling.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-[#8b949e]">
              Message trends, contributor quality, topic clusters, and churn prediction in one dashboard.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Who Pays</CardTitle>
              <CardDescription>Community managers of mid-size Discord servers.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-[#8b949e]">
              Teams managing 500-5000 members who need operational signals to protect engagement and paid retention.
            </CardContent>
          </Card>
        </section>

        <section id="pricing" className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-[#f0f6fc]">Pricing built for one clear outcome: healthier communities.</h2>
            <p className="text-[#8b949e]">
              One server license includes the Discord bot, analytics dashboard, and churn model updates. No seat-based pricing.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Included</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-[#8b949e]">
                  Contributor rankings, trend charts, churn risk scoring, topic word cloud, and webhook ingestion API.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Best Fit</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-[#8b949e]">
                  Paid communities, product support hubs, creator membership servers, and learning cohorts.
                </CardContent>
              </Card>
            </div>
          </div>
          <LemonCheckoutCard />
        </section>

        <section className="space-y-5 pb-12">
          <h2 className="text-2xl font-bold text-[#f0f6fc]">FAQ</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How does churn prediction work?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#8b949e]">
                We score each member by recency of activity, week-over-week message decline, and consistency across active days.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Do I need to export Discord data manually?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#8b949e]">
                No. The bot streams activity to your dashboard via secure webhook calls.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Is this only for large servers?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#8b949e]">
                It is optimized for 500-5000 member communities where retention signals become hard to track manually.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">When is access granted?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#8b949e]">
                As soon as your Lemon Squeezy payment webhook is received, you can activate access from the checkout success page.
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
