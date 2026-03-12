import { z } from 'zod';

export const createPatientSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        phone: z.string().regex(/^\d{10}$/, 'Phone must be a 10-digit number'),
        email: z.string().email('Invalid email').optional().nullable(),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
        dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional().nullable(),
    }),
});

export const updatePatientSchema = createPatientSchema.partial();

export const togglePatientStatusSchema = z.object({
    body: z.object({
        isActive: z.boolean(),
    }),
});
