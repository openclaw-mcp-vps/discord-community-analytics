import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID: z.string().optional(),
  NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const serverEnvSchema = z.object({
  LEMON_SQUEEZY_WEBHOOK_SECRET: z.string().min(1).optional(),
  DISCORD_INGEST_SECRET: z.string().optional(),
});

export function getPublicEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID,
    NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
}

export function getServerEnv() {
  return serverEnvSchema.parse({
    LEMON_SQUEEZY_WEBHOOK_SECRET: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET,
    DISCORD_INGEST_SECRET: process.env.DISCORD_INGEST_SECRET,
  });
}
