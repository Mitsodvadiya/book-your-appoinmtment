import prisma from '../../database/prisma';
import { CreateScheduleInput, UpdateScheduleInput } from './schedules.types';
import { ClinicRole } from '@prisma/client';

export class SchedulesService {
    static async createSchedule(doctorId: string, adminId: string, input: CreateScheduleInput) {
        // 1. Authorization: Only CLINIC_ADMIN of input.clinicId can manage this
        const adminMembership = await prisma.clinicMember.findUnique({
            where: {
                clinicId_userId: { clinicId: input.clinicId, userId: adminId },
            },
        });

        if (!adminMembership || adminMembership.role !== ClinicRole.CLINIC_ADMIN) {
            // Allow doctor to manage their own schedule if they belong to that clinic
            const isSelf = await prisma.doctorProfile.findFirst({
                where: { id: doctorId, userId: adminId },
            });

            const doctorMembership = await prisma.clinicMember.findUnique({
                where: { clinicId_userId: { clinicId: input.clinicId, userId: adminId } },
            });

            if (!isSelf || !doctorMembership) {
                throw { status: 403, message: 'Unauthorized: Only clinic admins or the doctor themselves can manage schedules' };
            }
        }

        // Convert HH:mm to Date object for today (only time property matters for comparison)
        const [startH, startM] = input.startTime.split(':').map(Number);
        const [endH, endM] = input.endTime.split(':').map(Number);

        const startTime = new Date();
        startTime.setHours(startH, startM, 0, 0);

        const endTime = new Date();
        endTime.setHours(endH, endM, 0, 0);

        if (startTime >= endTime) {
            throw { status: 400, message: 'Start time must be before end time' };
        }

        return await prisma.doctorSchedule.create({
            data: {
                doctorId,
                clinicId: input.clinicId,
                dayOfWeek: input.dayOfWeek,
                startTime,
                endTime,
                isActive: input.isActive,
            },
        });
    }

    static async listSchedules(doctorId: string) {
        return await prisma.doctorSchedule.findMany({
            where: { doctorId },
            orderBy: { dayOfWeek: 'asc' },
        });
    }

    static async updateSchedule(scheduleId: string, userId: string, input: UpdateScheduleInput) {
        const schedule = await prisma.doctorSchedule.findUnique({
            where: { id: scheduleId },
        });

        if (!schedule) {
            throw { status: 404, message: 'Schedule not found' };
        }

        // Auth check
        await this.verifyScheduleManager(schedule.clinicId, schedule.doctorId, userId);

        const data: any = { ...input };

        if (input.startTime || input.endTime) {
            const startStr = input.startTime || schedule.startTime.toISOString().split('T')[1].substring(0, 5);
            const endStr = input.endTime || schedule.endTime.toISOString().split('T')[1].substring(0, 5);

            const [startH, startM] = startStr.split(':').map(Number);
            const [endH, endM] = endStr.split(':').map(Number);

            const startTime = new Date();
            startTime.setHours(startH, startM, 0, 0);
            data.startTime = startTime;

            const endTime = new Date();
            endTime.setHours(endH, endM, 0, 0);
            data.endTime = endTime;

            if (startTime >= endTime) {
                throw { status: 400, message: 'Start time must be before end time' };
            }
        }

        return await prisma.doctorSchedule.update({
            where: { id: scheduleId },
            data,
        });
    }

    static async deleteSchedule(scheduleId: string, userId: string) {
        const schedule = await prisma.doctorSchedule.findUnique({
            where: { id: scheduleId },
        });

        if (!schedule) {
            throw { status: 404, message: 'Schedule not found' };
        }

        await this.verifyScheduleManager(schedule.clinicId, schedule.doctorId, userId);

        return await prisma.doctorSchedule.delete({
            where: { id: scheduleId },
        });
    }

    private static async verifyScheduleManager(clinicId: string, doctorId: string, userId: string) {
        const membership = await prisma.clinicMember.findUnique({
            where: { clinicId_userId: { clinicId, userId } },
        });

        const isSelf = await prisma.doctorProfile.findFirst({
            where: { id: doctorId, userId },
        });

        if (!membership || (membership.role !== ClinicRole.CLINIC_ADMIN && !isSelf)) {
            throw { status: 403, message: 'Unauthorized to manage this schedule' };
        }
    }
}
