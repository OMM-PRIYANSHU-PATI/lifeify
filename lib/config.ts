import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().default("file:./dev.db"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters"),
  OTP_TTL_MINUTES: z.coerce.number().int().positive().default(10),
  ADMIN_IDENTIFIERS: z.string().default("9999999999"),
  OCR_PROVIDER: z.enum(["mock", "local", "external"]).default("mock"),
  SUBSCRIPTION_PROVIDER: z.enum(["mock", "razorpay"]).default("mock"),
  NOTIFICATION_CHANNEL: z.enum(["inapp", "push", "email"]).default("inapp"),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    throw new Error("Invalid environment configuration. Check your .env file.");
  }
  return result.data;
}

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
