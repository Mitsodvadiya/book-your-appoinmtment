import { z } from 'zod';
import { TokenType, TokenStatus } from '@prisma/client';

export const generateTokenSchema = z.object({
    body: z.object({
        clinicId: z.string().uuid('Invalid clinic ID'),
        doctorId: z.string().uuid('Invalid doctor ID'),
        patientId: z.string().uuid('Invalid patient ID'),
        tokenType: z.nativeEnum(TokenType, {
            message: 'Invalid token type (ONLINE, WALKIN, or EMERGENCY)',
        }),
    }),
});

export const tokenIdParamSchema = z.object({
    params: z.object({
        tokenId: z.string().uuid('Invalid token ID'),
    }),
});

export const doctorIdParamSchema = z.object({
    params: z.object({
        doctorId: z.string().uuid('Invalid doctor ID'),
    }),
});
