import Link from "next/link";
import { BarChart3, Bot, ShieldAlert, Sparkles, TrendingDown } from "lucide-react";
import CheckoutButton from "@/components/CheckoutButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { listServers } from "@/lib/database/models";

const faq = [
  {
    question: "How is churn risk calculated?",
    answer:
      "Each member gets a 0-100 risk score from inactivity streaks, month-over-month message drop, and low recent participation. High-risk rows are people likely to go silent soon unless re-engaged."
  },
  {
    question: "Will this work on active servers with thousands of members?",
    answer:
      "Yes. The bot streams lightweight message/member events to the dashboard webhook, and analytics run on aggregated records rather than expensive per-request Discord queries."
  },
  {
    question: "Do I need to install another analytics bot?",
    answer:
      "No extra dashboard extension is required. Install this bot once, keep it online, and your server feed powers contributor ranking, trend charts, churn risk, and topic insights."
  },
  {
    question: "How does payment unlock access?",
    answer:
      "After checkout, Lemon Squeezy webhook marks your order as paid. Confirm your order ID on the unlock page and a secure cookie unlocks your dashboard for that server."
  }
];

export default function HomePage() {
  const servers = listServers();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-slate-800 bg-[#111827]/90 p-6 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Discord Community Analytics
            </p>
            <h1
              className="text-3xl font-semibold leading-tight text-slate-100 sm:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Know Which Members Drive Engagement and Predict Churn Before It Hits
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Community managers with 500-5000 members can finally track health, not just raw
              message counts. Measure contribution quality, trend engagement over time, and flag
              at-risk members early enough to intervene.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <CheckoutButton serverId="demo-server" className="w-full sm:w-auto">
                Start at $19 / server / month
              </CheckoutButton>
              <Link href="/dashboard/demo-server" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  Open Demo Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <a href="/api/auth/discord" className="underline underline-offset-4">
                Install bot on Discord
              </a>
              <span>•</span>
              <Link href="/paywall/confirm" className="underline underline-offset-4">
                Unlock after purchase
              </Link>
              <span>•</span>
              <a href="/api/health" className="underline underline-offset-4">
                Health endpoint
              </a>
            </div>
          </div>
          <Card className="bg-slate-950/70">
            <CardHeader>
              <CardTitle>What Discord admins miss today</CardTitle>
              <CardDescription>
                Existing tools report totals. They rarely explain momentum or retention risk.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <p className="font-medium text-slate-100">Blind spot #1: health vs. volume</p>
                <p className="mt-1 text-slate-400">
                  High daily message counts can hide a shrinking core contributor group.
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <p className="font-medium text-slate-100">Blind spot #2: churn signals</p>
                <p className="mt-1 text-slate-400">
                  Without risk scoring, members disappear before mods notice behavior changes.
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <p className="font-medium text-slate-100">Blind spot #3: topic pulse</p>
                <p className="mt-1 text-slate-400">
                  Word clouds expose where conversation energy is rising or fading by week.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sky-300" />
              Engagement Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Daily message frequency and active member movement over the last 30 days.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-amber-300" />
              Churn Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Risk table prioritizes who needs outreach by inactivity and participation decline.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-cyan-300" />
              Bot-Powered Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Drop in the bot, stream events through secure webhook ingestion, and monitor instantly.
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>
              One plan designed for serious Discord communities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-3xl font-semibold text-slate-100">$19</p>
              <p className="text-sm text-slate-400">per server / month</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Top contributor leaderboard with engagement score</li>
              <li>30-day message trend chart with activity baseline</li>
              <li>Churn risk model and intervention list</li>
              <li>Hot-topic word cloud for content strategy</li>
              <li>Webhook ingest endpoint + bot starter included</li>
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row">
              <CheckoutButton serverId="demo-server" className="w-full sm:w-auto" />
              <Link href="/paywall/confirm" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  Already purchased?
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proof in your own data</CardTitle>
            <CardDescription>
              Start with the demo workspace, then connect your production server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-sm text-slate-300">
                Your instance currently has <span className="font-semibold text-sky-300">{servers.length}</span>{" "}
                tracked server{servers.length === 1 ? "" : "s"}. Use `demo-server` to explore the full dashboard immediately.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
              <p className="font-medium text-slate-100">Production checklist</p>
              <p className="mt-1">
                Install the bot, set webhook secret, configure Lemon Squeezy env vars, then route
                your server admins through checkout + unlock flow.
              </p>
            </div>
            <div className="rounded-lg border border-amber-700/40 bg-amber-500/10 p-4 text-sm text-amber-200">
              <p className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                Keep `LEMON_SQUEEZY_WEBHOOK_SECRET` private. It signs both webhook verification and
                dashboard access tokens.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
            <CardDescription>
              Operational answers for community managers and moderators.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {faq.map((entry) => (
              <details key={entry.question} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <summary className="cursor-pointer font-medium text-slate-100">
                  {entry.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{entry.answer}</p>
              </details>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
