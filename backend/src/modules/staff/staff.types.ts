import { ClinicRole } from '@prisma/client';

export interface AddStaffInput {
    name: string;
    email: string;
    phone: string;
    role: ClinicRole; // Must be DOCTOR, STAFF, or CLINIC_ADMIN
    
    // Optional fields only used if role === 'DOCTOR'
    specialization?: string;
    consultationDuration?: number;
    maxTokensPerDay?: number;
}

export interface UpdateStaffInput {
    name?: string;
    phone?: string;
    role?: ClinicRole;
}

export interface ToggleStaffStatusInput {
    isActive: boolean;
}
