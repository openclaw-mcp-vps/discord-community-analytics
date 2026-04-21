import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const problemPoints = [
  "Raw message counts miss quality and momentum shifts.",
  "Silent churn starts weeks before members leave.",
  "Moderators spend time reacting instead of preventing disengagement."
];

const solutionPoints = [
  {
    title: "Top contributor intelligence",
    copy: "Identify members driving useful discussion so you can reward and retain them."
  },
  {
    title: "Engagement trend timelines",
    copy: "Track posting volume and active-member patterns daily to detect slowdowns early."
  },
  {
    title: "Churn risk scoring",
    copy: "Surface at-risk members by inactivity + engagement drop so your team can intervene."
  },
  {
    title: "Topic heat maps",
    copy: "Understand what members care about now with a live word cloud across recent messages."
  }
];

const faqs = [
  {
    q: "How quickly does data show up after bot installation?",
    a: "Message events stream to your dashboard in near-real time, while member snapshots refresh hourly by default."
  },
  {
    q: "Does this replace moderation bots?",
    a: "No. This complements moderation tools by adding retention and engagement health insights."
  },
  {
    q: "Can I use this on multiple servers?",
    a: "Yes. Billing is per server, so each community gets isolated analytics and access control."
  },
  {
    q: "What server size is this built for?",
    a: "Best fit is active communities between 500 and 5,000 members where churn blind spots are costly."
  }
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="animate-rise rounded-2xl border border-slate-800 bg-slate-950/70 p-8 backdrop-blur sm:p-12">
        <p className="mb-4 inline-flex rounded-full border border-sky-900 bg-sky-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-300">
          Community Analytics for Discord
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-100 sm:text-5xl">
          Discord Community Analytics, built to protect engagement before churn starts.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-300">
          Add one bot and get a health dashboard that shows who drives conversation, where momentum is
          fading, and which members are likely to disengage next.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}>
            <Button size="lg">Start for $19/server/month</Button>
          </a>
          <Link href="/purchase/activate">
            <Button size="lg" variant="outline">
              I already purchased
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="ghost">
              View Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <section className="animate-rise-delay-1 mt-12 grid gap-6 lg:grid-cols-3">
        {problemPoints.map((point) => (
          <Card key={point} className="border-rose-900/50 bg-rose-950/20">
            <CardHeader>
              <CardTitle className="text-lg text-rose-200">Problem</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">{point}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="animate-rise-delay-2 mt-14">
        <h2 className="mb-6 text-2xl font-semibold text-slate-100">What You Get</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {solutionPoints.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{item.copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-sky-900/40 bg-sky-950/20">
          <CardHeader>
            <CardTitle className="text-xl">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-4xl font-bold text-slate-100">$19<span className="text-lg text-slate-400">/server/mo</span></p>
            <p className="text-slate-300">
              Built for community managers who need weekly retention visibility without enterprise analytics overhead.
            </p>
            <a href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}>
              <Button className="w-full">Buy With Stripe Checkout</Button>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">After Purchase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300">
            <p>1. Complete Stripe hosted checkout.</p>
            <p>2. Install the Discord bot in your server.</p>
            <p>3. Activate dashboard access with your billing email.</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-14">
        <h2 className="mb-6 text-2xl font-semibold text-slate-100">FAQ</h2>
        <div className="grid gap-4">
          {faqs.map((item) => (
            <Card key={item.q}>
              <CardHeader>
                <CardTitle className="text-base">{item.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
