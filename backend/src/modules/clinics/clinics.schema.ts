import { z } from 'zod';
import { ClinicRole } from '@prisma/client';

export const createClinicSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        address: z.string().min(5, 'Address must be at least 5 characters'),
        city: z.string().min(2, 'City must be at least 2 characters'),
        state: z.string().min(2, 'State must be at least 2 characters'),
        country: z.string().min(2, 'Country must be at least 2 characters'),
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
        email: z.string().email('Invalid email format'),
        logo: z.string().url('Invalid logo URL').optional(),
    }),
});

export const updateClinicSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        address: z.string().min(5).optional(),
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
        email: z.string().email().optional(),
        logo: z.string().url().optional(),
    }),
});

export const inviteStaffSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email format'),
        role: z.nativeEnum(ClinicRole, {
            message: 'Role must be DOCTOR or STAFF',
        }),
    }),
});
