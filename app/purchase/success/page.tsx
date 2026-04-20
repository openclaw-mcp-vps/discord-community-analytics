import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { UnlockAccessForm } from "@/components/UnlockAccessForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PurchaseSuccessPageProps {
  searchParams: Promise<{ serverId?: string; token?: string }>;
}

export default async function PurchaseSuccessPage({ searchParams }: PurchaseSuccessPageProps) {
  const params = await searchParams;
  const serverId = params.serverId?.trim();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-20">
      <Card className="glow bg-[#111926]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle2 className="h-6 w-6 text-emerald-300" />
            Payment received
          </CardTitle>
          <CardDescription>
            Your Lemon Squeezy order is being verified via webhook. Unlock access once verification is complete.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300">
          {serverId ? (
            <>
              <p>
                Target server: <span className="font-semibold text-slate-100">{serverId}</span>
              </p>
              <UnlockAccessForm serverId={serverId} token={params.token} />
            </>
          ) : (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-amber-200">
              Missing server ID in return URL. Restart checkout from the pricing section so access can be linked correctly.
            </div>
          )}

          <p>
            If verification is delayed, wait a few seconds and retry. The dashboard stays locked until webhook confirmation is
            recorded.
          </p>

          <Link className="text-blue-300 underline-offset-4 hover:underline" href="/">
            Back to landing page
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
