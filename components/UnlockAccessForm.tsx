"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function UnlockAccessForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialOrderId = searchParams?.get("order_id") ?? "";
  const initialEmail = searchParams?.get("email") ?? "";
  const initialServerId = searchParams?.get("server") ?? "demo-server";

  const [orderId, setOrderId] = useState(initialOrderId);
  const [email, setEmail] = useState(initialEmail);
  const [serverId, setServerId] = useState(initialServerId);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/paywall/activate", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ orderId, email, serverId })
    });

    const data = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok || !data.ok) {
      setStatus("error");
      setMessage(
        data.error ??
          "We couldn't validate this purchase yet. Wait for webhook delivery, then retry."
      );
      return;
    }

    router.push(`/dashboard/${encodeURIComponent(serverId)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="orderId" className="text-sm text-slate-300">
          Lemon Squeezy Order ID
        </label>
        <input
          id="orderId"
          required
          value={orderId}
          onChange={(event) => setOrderId(event.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-400"
          placeholder="123456"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm text-slate-300">
          Purchase email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-400"
          placeholder="you@company.com"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="serverId" className="text-sm text-slate-300">
          Discord server ID
        </label>
        <input
          id="serverId"
          required
          value={serverId}
          onChange={(event) => setServerId(event.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-400"
          placeholder="123456789012345678"
        />
      </div>
      <Button type="submit" disabled={status === "loading"} className="w-full">
        {status === "loading" ? "Validating purchase..." : "Activate dashboard access"}
      </Button>
      {status === "error" ? (
        <p className="text-sm text-rose-300">{message}</p>
      ) : (
        <p className="text-xs text-slate-400">
          Access is issued only after `/api/lemonsqueezy/webhook` records your paid order.
        </p>
      )}
    </form>
  );
}
