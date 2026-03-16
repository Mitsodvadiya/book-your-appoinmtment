import prisma from '../../database/prisma';

export class ClinicWorkingHoursService {
    static async createWorkingHoursDetailed(
        clinicId: string,
        schedules: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[]
    ) {
        // Delete existing working hours for this clinic
        await prisma.clinicWorkingHours.deleteMany({
            where: { clinicId },
        });

        const workingHoursData = schedules.map((schedule) => ({
            clinicId,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            isActive: schedule.isActive,
        }));

        const result = await prisma.clinicWorkingHours.createMany({
            data: workingHoursData,
        });

        return result;
    }

    static async createWorkingHours(
        clinicId: string,
        startTime: string,
        endTime: string,
        workingDays: number[]
    ) {
        // Delete existing working hours for this clinic to avoid duplicates if re-onboarding/updating
        await prisma.clinicWorkingHours.deleteMany({
            where: { clinicId },
        });

        // Create new records for each working day
        const workingHoursData = workingDays.map((day) => ({
            clinicId,
            dayOfWeek: day,
            startTime,
            endTime,
            isActive: true,
        }));

        const result = await prisma.clinicWorkingHours.createMany({
            data: workingHoursData,
        });

        return result;
    }

    static async getWorkingHours(clinicId: string) {
        return prisma.clinicWorkingHours.findMany({
            where: { clinicId },
            orderBy: { dayOfWeek: 'asc' },
        });
    }
}
