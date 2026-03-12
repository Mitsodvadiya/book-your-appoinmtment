import { z } from 'zod';

export const addDoctorSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email format'),
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
        specialization: z.string().min(2, 'Specialization is required'),
        consultationDuration: z.number().positive('Duration must be greater than 0'),
        maxTokensPerDay: z.number().positive('Max tokens must be greater than 0'),
    }),
});

export const updateDoctorSchema = z.object({
    body: z.object({
        specialization: z.string().min(2).optional(),
        consultationDuration: z.number().positive().optional(),
        maxTokensPerDay: z.number().positive().optional(),
    }),
});

export const toggleStatusSchema = z.object({
    body: z.object({
        isActive: z.boolean(),
    }),
});
