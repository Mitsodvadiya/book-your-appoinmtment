import { z } from 'zod';
import { ClinicRole } from '@prisma/client';

export const addStaffSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        phone: z.string().min(10, 'Phone must be at least 10 characters'),
        role: z.nativeEnum(ClinicRole, {
            message: 'Role must be CLINIC_ADMIN, DOCTOR, or STAFF',
        }),
        
        // Optional fields strictly validated only if role === DOCTOR
        specialization: z.string().optional(),
        consultationDuration: z.number().int().min(5).optional(),
        maxTokensPerDay: z.number().int().min(1).optional(),
    }).refine((data) => {
        // If the role is DOCTOR, these fields become mandatory.
        if (data.role === 'DOCTOR') {
            return data.specialization !== undefined &&
                   data.consultationDuration !== undefined &&
                   data.maxTokensPerDay !== undefined;
        }
        return true;
    }, {
        message: 'specialization, consultationDuration, and maxTokensPerDay are required for DOCTOR role.',
        path: ['role'], 
    })
});

export const updateStaffSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        phone: z.string().min(10).optional(),
        role: z.nativeEnum(ClinicRole).optional(),
    }),
});

export const toggleStaffStatusSchema = z.object({
    body: z.object({
        isActive: z.boolean(),
    }),
});
