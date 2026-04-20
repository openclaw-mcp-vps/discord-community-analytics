"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    LemonSqueezy?: {
      Url?: {
        Open?: (url: string) => void;
      };
    };
    createLemonSqueezy?: () => void;
  }
}

const checkoutScriptId = "lemonsqueezy-overlay-script";

export function LemonCheckoutCard() {
  const [serverId, setServerId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isReady = !!process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;

  const loadLemonScript = () => {
    if (document.getElementById(checkoutScriptId)) {
      if (window.createLemonSqueezy) {
        window.createLemonSqueezy();
      }
      return;
    }

    const script = document.createElement("script");
    script.id = checkoutScriptId;
    script.src = "https://assets.lemonsqueezy.com/lemon.js";
    script.defer = true;
    script.onload = () => {
      if (window.createLemonSqueezy) {
        window.createLemonSqueezy();
      }
    };
    document.body.appendChild(script);
  };

  const handleCheckout = () => {
    setError(null);

    if (!isReady) {
      setError("Missing Lemon Squeezy product ID. Set NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID.");
      return;
    }

    const cleanServerId = serverId.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanServerId) {
      setError("Discord server ID is required to map this purchase to the right workspace.");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Enter the same billing email you will use during checkout.");
      return;
    }

    const rawProduct = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID as string;
    const checkoutBase = rawProduct.startsWith("http")
      ? rawProduct
      : `https://checkout.lemonsqueezy.com/buy/${rawProduct}`;

    const url = new URL(checkoutBase);
    url.searchParams.set("checkout[email]", cleanEmail);
    url.searchParams.set("checkout[custom][server_id]", cleanServerId);
    url.searchParams.set("checkout[success_url]", `${window.location.origin}/checkout/success?serverId=${encodeURIComponent(cleanServerId)}`);

    loadLemonScript();

    if (window.LemonSqueezy?.Url?.Open) {
      window.LemonSqueezy.Url.Open(url.toString());
      return;
    }

    window.location.href = url.toString();
  };

  return (
    <Card className="border-[#2f81f7]/30 bg-gradient-to-b from-[#161b22] to-[#11161d]">
      <CardHeader>
        <CardTitle className="text-2xl">$19 / server / month</CardTitle>
        <CardDescription>
          Built for 500-5000 member communities that need retention analytics, not vanity counts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={serverId}
          onChange={(e) => setServerId(e.target.value)}
          placeholder="Discord server ID"
          aria-label="Discord server ID"
        />
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Billing email"
          aria-label="Billing email"
          type="email"
        />
        <ul className="space-y-2 text-sm text-[#8b949e]">
          <li>Top contributor leaderboard with activity depth</li>
          <li>Churn risk prediction by member behavior change</li>
          <li>Topic cloud to identify what drives repeat engagement</li>
        </ul>
        {error ? <p className="text-sm text-[#ff7b72]">{error}</p> : null}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3">
        <Button className="w-full" size="lg" onClick={handleCheckout}>
          Start Subscription
        </Button>
        <p className="text-xs text-[#8b949e]">
          After checkout, open the success page to activate dashboard access for this server.
        </p>
      </CardFooter>
    </Card>
  );
}
