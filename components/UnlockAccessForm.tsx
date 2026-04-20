"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnlockAccessFormProps {
  serverId: string;
  token?: string;
}

export function UnlockAccessForm({ serverId, token }: UnlockAccessFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const unlock = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ serverId, token })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Purchase verification still pending.");
      }

      router.push(`/dashboard/${serverId}`);
      router.refresh();
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Could not unlock dashboard.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-[#121821] p-5">
      <Button size="lg" className="w-full" onClick={unlock} disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockOpen className="mr-2 h-4 w-4" />}
        Unlock Analytics Dashboard
      </Button>
      <p className="text-xs text-slate-400">
        Verification checks your Lemon Squeezy purchase webhook before granting paid cookie access.
      </p>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
