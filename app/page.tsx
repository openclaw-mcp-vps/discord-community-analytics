import Link from "next/link";
import { Activity, AlertTriangle, BrainCircuit, MessageSquareMore, ShieldCheck, TrendingUp } from "lucide-react";
import { PricingSection } from "@/components/PricingSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HomePageProps {
  searchParams: Promise<{ locked?: string; server?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const showPaywallNotice = params.locked === "1";

  return (
    <main className="min-h-screen pb-16">
      <section className="grid-bg border-b border-slate-800/80">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <p className="fade-slide inline-flex rounded-full border border-blue-400/40 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
            Discord Community Analytics
          </p>
          <h1 className="fade-slide mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
            Know exactly who drives engagement and predict churn before your Discord goes quiet.
          </h1>
          <p className="fade-slide-delay mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Add one bot to your server and get a health-focused dashboard: top contributors, message frequency trends,
            at-risk members, and topic-level visibility from real conversation data.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#pricing">
              <Button size="lg">Start Tracking for $19/mo</Button>
            </a>
            <Link href="/dashboard/demo-server">
              <Button variant="outline" size="lg">
                Open Dashboard Route
              </Button>
            </Link>
          </div>

          {showPaywallNotice ? (
            <div className="mt-6 max-w-xl rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              This dashboard is paywalled. Complete checkout for server <strong>{params.server ?? "unknown"}</strong> and unlock
              access from the purchase confirmation page.
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="bg-[#111926]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-amber-300" />
                Problem: admins fly blind
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Raw message counts miss what matters: who sustains momentum, where participation is dropping, and who is about
              to disengage.
            </CardContent>
          </Card>
          <Card className="bg-[#111926]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BrainCircuit className="h-4 w-4 text-blue-300" />
                Solution: health + prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              We combine engagement velocity, recency, and behavior change patterns to flag churn risk early while surfacing
              the members creating durable value.
            </CardContent>
          </Card>
          <Card className="bg-[#111926]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Built for 500-5000 members
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Purpose-built for community managers running growing Discords where retention outcomes matter more than vanity
              counts.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-[#111926]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="h-5 w-5 text-blue-300" />
                What you get in the dashboard
              </CardTitle>
              <CardDescription>Actionable analytics, not vanity charts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p className="flex items-start gap-2">
                <Activity className="mt-0.5 h-4 w-4 text-blue-300" />
                Daily message velocity and active member trends with momentum direction.
              </p>
              <p className="flex items-start gap-2">
                <MessageSquareMore className="mt-0.5 h-4 w-4 text-emerald-300" />
                Top contributor leaderboard weighted for consistency, not one-off spikes.
              </p>
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
                At-risk churn watchlist with inactivity and week-over-week decline context.
              </p>
              <p className="flex items-start gap-2">
                <BrainCircuit className="mt-0.5 h-4 w-4 text-indigo-300" />
                Word cloud of hot topics from live conversation streams.
              </p>
            </CardContent>
          </Card>

          <div id="pricing">
            <PricingSection />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <Card className="bg-[#111926]">
          <CardHeader>
            <CardTitle className="text-2xl">FAQ</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 text-sm text-slate-300 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-100">How is churn risk predicted?</h3>
              <p className="mt-2">
                We score each member using inactivity window, recent activity decline, and message behavior shifts between the
                last two weeks.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">Will this replace StatBot?</h3>
              <p className="mt-2">
                It complements count-focused bots by adding health and retention context so moderators can intervene before
                valuable members drift away.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">How long does setup take?</h3>
              <p className="mt-2">
                Usually under ten minutes: add the bot, configure the webhook URL, and post in active channels to start seeing
                useful insights.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">Can I invite multiple admins?</h3>
              <p className="mt-2">Yes. One paid server unlock supports unlimited admin users for analytics access.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
