import { z } from 'zod';
import { registerSchema, loginSchema } from './auth.schema';

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];

export interface JWTPayload {
    userId: string;
    role: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
