import Link from "next/link";

import { ActivateAccessForm } from "@/components/ActivateAccessForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivateAccessPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function ActivateAccessPage({ searchParams }: ActivateAccessPageProps) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/dashboard";

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Activate Your Dashboard</CardTitle>
          <CardDescription>
            After paying through Stripe Checkout, enter the same billing email to unlock analytics access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <a href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}>
            <Button className="w-full" variant="secondary">
              Buy Access ($19/server/month)
            </Button>
          </a>

          <ActivateAccessForm nextPath={nextPath} />

          <div className="text-center text-sm text-slate-400">
            Need help wiring webhook events? <Link href="/">See setup details on the landing page.</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
