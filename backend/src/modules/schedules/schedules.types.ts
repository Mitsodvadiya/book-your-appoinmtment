export interface CreateScheduleInput {
    dayOfWeek: number;
    startTime: string; // ISO string or HH:mm
    endTime: string;
    isActive: boolean;
    clinicId: string;
}

export interface UpdateScheduleInput {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    isActive?: boolean;
}

export interface ScheduleResponse {
    id: string;
    doctorId: string;
    clinicId: string;
    dayOfWeek: number;
    startTime: Date;
    endTime: Date;
    isActive: boolean;
    createdAt: Date;
}
