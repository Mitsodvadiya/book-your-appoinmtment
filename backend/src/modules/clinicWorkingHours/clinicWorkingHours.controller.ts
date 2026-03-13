import { Request, Response, NextFunction } from 'express';
import { ClinicWorkingHoursService } from './clinicWorkingHours.service';
import { successResponse } from '../../utils/response';
import { UserRole } from '@prisma/client';

export class ClinicWorkingHoursController {
    static async saveWorkingHours(req: any, res: Response, next: NextFunction) {
        try {
            const { clinicId } = req.params;
            const { startTime, endTime, workingDays } = req.body;

            // Simple validation
            if (!startTime || !endTime || !workingDays || !Array.isArray(workingDays)) {
                throw { status: 400, message: 'Missing required fields: startTime, endTime, or workingDays array' };
            }

            // Check if user is CLINIC_ADMIN
            if (req.user.role !== UserRole.CLINIC_ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
                 throw { status: 403, message: 'Only clinic administrators can perform this action' };
            }

            await ClinicWorkingHoursService.createWorkingHours(clinicId, startTime, endTime, workingDays);

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
