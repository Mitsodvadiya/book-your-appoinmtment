import { Request, Response, NextFunction } from 'express';
import { ClinicWorkingHoursService } from './clinicWorkingHours.service';
import { successResponse } from '../../utils/response';
import { UserRole } from '@prisma/client';

export class ClinicWorkingHoursController {
    static async saveWorkingHours(req: any, res: Response, next: NextFunction) {
        try {
            const { clinicId } = req.params;
            const { startTime, endTime, workingDays, schedules } = req.body;

            // Check if user is CLINIC_ADMIN
            if (req.user.role !== UserRole.CLINIC_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
                 throw { status: 403, message: 'Only clinic administrators can perform this action' };
            }

            if (schedules && Array.isArray(schedules)) {
                await ClinicWorkingHoursService.createWorkingHoursDetailed(clinicId, schedules);
            } else {
                // Simple validation for backward compatibility
                if (!startTime || !endTime || !workingDays || !Array.isArray(workingDays)) {
                    throw { status: 400, message: 'Missing required fields: startTime, endTime, or workingDays array' };
                }
                await ClinicWorkingHoursService.createWorkingHours(clinicId, startTime, endTime, workingDays);
            }

            return successResponse(res, null, 'Clinic working hours saved successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    static async getWorkingHours(req: any, res: Response, next: NextFunction) {
        try {
            const { clinicId } = req.params;
            const workingHours = await ClinicWorkingHoursService.getWorkingHours(clinicId);
            return successResponse(res, workingHours, 'Clinic working hours fetched successfully');
        } catch (error) {
            next(error);
        }
    }
}
