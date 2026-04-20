"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
  serverId: string;
  className?: string;
  children?: string;
}

export default function CheckoutButton({
  serverId,
  className,
  children = "Unlock Dashboard"
}: CheckoutButtonProps) {
  const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;

  const checkoutUrl = useMemo(() => {
    if (!productId) {
      return null;
    }

    const params = new URLSearchParams({
      embed: "1",
      media: "0",
      logo: "0",
      "checkout[custom][server_id]": serverId,
      "checkout[custom][source]": "discord-community-analytics"
    });

    return `https://checkout.lemonsqueezy.com/buy/${productId}?${params.toString()}`;
  }, [productId, serverId]);

  if (!checkoutUrl) {
    return (
      <Button variant="outline" className={className} disabled>
        Configure Lemon Squeezy product ID first
      </Button>
    );
  }

  return (
    <a href={checkoutUrl} className="lemonsqueezy-button">
      <Button className={className}>{children}</Button>
    </a>
  );
}
