import { z } from 'zod';

export const createScheduleSchema = z.object({
    body: z.object({
        clinicId: z.string().uuid(),
        dayOfWeek: z.number().min(0).max(6), // 0=Sunday, 6=Saturday
        startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
        endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
        isActive: z.boolean().default(true),
    }),
});

export const updateScheduleSchema = z.object({
    body: z.object({
        dayOfWeek: z.number().min(0).max(6).optional(),
        startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)').optional(),
        endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)').optional(),
        isActive: z.boolean().optional(),
    }),
});
