import { Response, NextFunction } from 'express';
import { SchedulesService } from './schedules.service';
import { successResponse } from '../../utils/response';

export class SchedulesController {
    static async create(req: any, res: Response, next: NextFunction) {
        try {
            const schedule = await SchedulesService.createSchedule(req.params.doctorId, req.user.userId, req.body);
            return successResponse(res, schedule, 'Schedule created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    static async list(req: any, res: Response, next: NextFunction) {
        try {
            const schedules = await SchedulesService.listSchedules(req.params.doctorId);
            return successResponse(res, schedules, 'Schedules fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async update(req: any, res: Response, next: NextFunction) {
        try {
            const schedule = await SchedulesService.updateSchedule(req.params.scheduleId, req.user.userId, req.body);
            return successResponse(res, schedule, 'Schedule updated successfully');
        } catch (error) {
            next(error);
        }
    }

    static async delete(req: any, res: Response, next: NextFunction) {
        try {
            await SchedulesService.deleteSchedule(req.params.scheduleId, req.user.userId);
            return successResponse(res, null, 'Schedule deleted successfully');
        } catch (error) {
            next(error);
        }
    }
}
