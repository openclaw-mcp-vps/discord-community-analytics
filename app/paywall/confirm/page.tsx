import { Suspense } from "react";
import Link from "next/link";
import UnlockAccessForm from "@/components/UnlockAccessForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default function ConfirmPaywallPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Activate Your Paid Dashboard Access</CardTitle>
          <CardDescription>
            Enter your Lemon Squeezy order details. We verify against webhook records and issue a
            secure access cookie for your Discord server dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Suspense
            fallback={
              <p className="text-sm text-slate-400">Loading purchase activation form...</p>
            }
          >
            <UnlockAccessForm />
          </Suspense>
          <p className="text-xs text-slate-500">
            Need a fresh checkout? <Link className="underline" href="/">Return to pricing</Link>.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
