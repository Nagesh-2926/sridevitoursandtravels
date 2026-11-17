import "server-only";
import { z } from "zod";

/**
 * Server environment, validated once on first use. Secrets are only ever
 * read here, never from client components. Later-phase variables are
 * optional until those phases land.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(32).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;

export function env(): Env {
  cached ??= EnvSchema.parse({
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL || undefined,
    AUTH_SECRET: process.env.AUTH_SECRET || undefined,
  });
  return cached;
}
