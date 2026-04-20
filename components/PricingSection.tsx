"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    LemonSqueezy?: {
      Url?: {
        Open: (url: string) => void;
      };
    };
  }
}

export function PricingSection() {
  const [serverId, setServerId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startCheckout = async () => {
    if (!serverId.trim()) {
      setError("Enter your Discord server ID to bind analytics and billing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ serverId: serverId.trim(), email: email.trim() || undefined })
      });

      const payload = (await response.json()) as { checkoutUrl?: string; error?: string };

      if (!response.ok || !payload.checkoutUrl) {
        throw new Error(payload.error ?? "Failed to create checkout session.");
      }

      if (window.LemonSqueezy?.Url?.Open) {
        window.LemonSqueezy.Url.Open(payload.checkoutUrl);
      } else {
        window.open(payload.checkoutUrl, "_blank", "noopener,noreferrer");
      }
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Could not launch checkout.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glow bg-[#111926]">
      <CardHeader>
        <CardTitle className="text-2xl">$19 per server / month</CardTitle>
        <CardDescription>
          Unlimited admins, real-time Discord ingestion, churn watchlist, and engagement trend analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="server-id">
            Discord Server ID
          </label>
          <Input
            id="server-id"
            placeholder="123456789012345678"
            value={serverId}
            onChange={(event) => setServerId(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="manager-email">
            Admin Email (receipt + purchase recovery)
          </label>
          <Input
            id="manager-email"
            type="email"
            placeholder="admin@community.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-md border border-rose-900/70 bg-rose-900/20 p-3 text-sm text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Button className="w-full sm:w-auto" size="lg" onClick={startCheckout} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
          Launch Checkout Overlay
        </Button>
        <p className="text-xs text-slate-400">After payment, you unlock this server dashboard instantly via secure cookie access.</p>
      </CardFooter>
    </Card>
  );
}
