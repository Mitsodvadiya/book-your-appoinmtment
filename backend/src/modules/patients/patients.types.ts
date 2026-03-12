export interface CreatePatientInput {
    name: string;
    phone: string;
    email?: string | null;
    gender?: string | null;
    dateOfBirth?: string | null;
}

export interface PatientResponse {
    id: string;
    clinicId: string;
    name: string;
    phone: string;
    email: string | null;
    gender: string | null;
    dateOfBirth: Date | null;
    isActive: boolean;
    createdAt: Date;
}

export interface UpdatePatientInput {
    name?: string;
    phone?: string;
    email?: string | null;
    gender?: string | null;
    dateOfBirth?: string | null;
}

export interface TogglePatientStatusInput {
    isActive: boolean;
}
