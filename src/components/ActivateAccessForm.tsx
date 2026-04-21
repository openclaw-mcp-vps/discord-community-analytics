"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ActivateAccessFormProps {
  nextPath: string;
}

export function ActivateAccessForm({ nextPath }: ActivateAccessFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttonLabel = useMemo(() => {
    if (isSubmitting) {
      return "Verifying purchase...";
    }

    return "Activate Dashboard Access";
  }, [isSubmitting]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/paywall/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not verify your purchase yet.");
        return;
      }

      router.push(nextPath || "/dashboard");
      router.refresh();
    } catch {
      setError("Network error while verifying payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300" htmlFor="billing-email">
          Billing email used at checkout
        </label>
        <Input
          id="billing-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
        />
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {buttonLabel}
      </Button>
    </form>
  );
}
