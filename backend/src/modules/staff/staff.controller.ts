import { Response, NextFunction } from 'express';
import { StaffService } from './staff.service';
import { successResponse } from '../../utils/response';

export class StaffController {
    static async add(req: any, res: Response, next: NextFunction) {
        try {
            const member = await StaffService.addStaff(req.params.clinicId, req.user.userId, req.body);
            return successResponse(res, member, 'Staff member added to clinic successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    static async listByClinic(req: any, res: Response, next: NextFunction) {
        try {
            const members = await StaffService.listStaffInClinic(req.params.clinicId, req.user.userId);
            return successResponse(res, members, 'Staff fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async update(req: any, res: Response, next: NextFunction) {
        try {
            const profile = await StaffService.updateStaffInfo(req.params.userId, req.user.userId, req.body);
            return successResponse(res, profile, 'Staff profile updated successfully');
        } catch (error) {
            next(error);
        }
    }

    static async toggleStatus(req: any, res: Response, next: NextFunction) {
        try {
            const profile = await StaffService.toggleStatus(req.params.userId, req.user.userId, req.body);
            const statusMsg = profile.status ? 'enabled' : 'disabled';
            return successResponse(res, profile, `User ${statusMsg} successfully`);
        } catch (error) {
            next(error);
        }
    }
}
