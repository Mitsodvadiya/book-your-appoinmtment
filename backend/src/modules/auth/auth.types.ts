import { z } from 'zod';
import { registerSchema, loginSchema } from './auth.schema';
import { UserRole } from '@prisma/client';

export type RegisterInput = z.infer<typeof registerSchema>['body'] & { role?: UserRole };
export type LoginInput = z.infer<typeof loginSchema>['body'];

export interface JWTPayload {
    userId: string;
    role: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
