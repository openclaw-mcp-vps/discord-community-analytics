"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ActivateAccessFormProps {
  defaultServerId: string;
  defaultOrderId: string;
}

export function ActivateAccessForm({ defaultServerId, defaultOrderId }: ActivateAccessFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [serverId, setServerId] = useState(defaultServerId);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => !!orderId || !!email, [orderId, email]);

  const activate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/paywall/activate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        orderId: orderId || undefined,
        email: email || undefined,
        serverId: serverId || undefined,
      }),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Activation failed. Check your details and try again.");
      setLoading(false);
      return;
    }

    setMessage("Access granted. Redirecting to dashboard...");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Checkout Complete</CardTitle>
        <CardDescription>
          Activate your dashboard access using the billing email or order ID from Lemon Squeezy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={activate} className="space-y-4">
          <Input
            value={serverId}
            onChange={(e) => setServerId(e.target.value)}
            placeholder="Discord server ID"
            aria-label="Discord server ID"
          />
          <Input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order ID (recommended)"
            aria-label="Order ID"
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Billing email"
            aria-label="Billing email"
            type="email"
          />

          {error ? <p className="text-sm text-[#ff7b72]">{error}</p> : null}
          {message ? <p className="text-sm text-[#7ee787]">{message}</p> : null}

          <Button type="submit" className="w-full" disabled={!canSubmit || loading}>
            {loading ? "Activating..." : "Activate Dashboard Access"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
