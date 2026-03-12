import { z } from 'zod';

export const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').optional(),
        phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
    }).refine((data) => data.name || data.phone, {
        message: 'At least one field (name or phone) must be provided for update',
    }),
});
