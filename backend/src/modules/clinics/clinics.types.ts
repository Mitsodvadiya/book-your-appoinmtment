import { z } from 'zod';
import { createClinicSchema, updateClinicSchema, inviteStaffSchema } from './clinics.schema';

export type CreateClinicInput = z.infer<typeof createClinicSchema>['body'];
export type UpdateClinicInput = z.infer<typeof updateClinicSchema>['body'];
export type InviteStaffInput = z.infer<typeof inviteStaffSchema>['body'];

export interface ClinicMemberResponse {
    userId: string;
    name: string;
    email: string;
    role: string;
}
