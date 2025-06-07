import { config } from "dotenv";
import { z } from "zod";

config();

export const envSchema = z.object({
  APP_NAME: z.string({
    message: "APP_NAME is required",
  }),
  PORT: z.coerce.number(),
});

export type EnvVariables = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

const env = result.data;

export { env };

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
