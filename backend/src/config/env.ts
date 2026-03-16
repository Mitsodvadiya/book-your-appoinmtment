import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('5000'),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string(),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    EMAIL_HOST: z.string(),
    EMAIL_PORT: z.string().transform((val) => parseInt(val, 10)),
    EMAIL_USER: z.string(),
    EMAIL_PASS: z.string(),
    EMAIL_FROM: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;
