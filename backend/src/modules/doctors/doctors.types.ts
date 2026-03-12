import { z } from 'zod';
import { addDoctorSchema, updateDoctorSchema, toggleStatusSchema } from './doctors.schema';

export type AddDoctorInput = z.infer<typeof addDoctorSchema>['body'];
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>['body'];
export type ToggleStatusInput = z.infer<typeof toggleStatusSchema>['body'];

export interface DoctorResponse {
    doctorId: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    specialization: string;
    consultationDuration: number;
    maxTokensPerDay: number;
    isActive: boolean;
    createdAt: Date;
}
