import { config } from "dotenv";
import { z } from "zod";

config();

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  APP_NAME: z.string({
    message: "APP_NAME is required",
  }),
  PORT: z.coerce.number(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_ADMIN_USER: z.string().email(),
  DB_ADMIN_PASSWORD: z.string(),
  DB_ADMIN_PORT: z.coerce.number(),
  PASSWORD_SECRET: z.string(),
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_REFRESH_TOKEN_SECRET: z.string(),
});

export type EnvVariables = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

/**
 * ONLY USE IN OUTSIDE THE NEST.JS
 */
export const ONLY_USE_OUTSIDE_NEST_ENV = result.data;

export const validateEnv = (config: Record<string, unknown>) => {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const issues = result.error.errors
      .map((err) => {
        const path = err.path.join(".");
        return `- ${path || "root"}: ${err.message}`;
      })
      .join("\n");
    throw new Error(`❌ Invalid environment variables:\n${issues}`);
  }

  return result.data;
};
