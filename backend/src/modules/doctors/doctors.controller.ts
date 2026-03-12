import { Response, NextFunction } from 'express';
import { DoctorsService } from './doctors.service';
import { successResponse } from '../../utils/response';

export class DoctorsController {
    static async add(req: any, res: Response, next: NextFunction) {
        try {
            const doctor = await DoctorsService.addDoctor(req.params.clinicId, req.user.userId, req.body);
            return successResponse(res, doctor, 'Doctor added to clinic successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    static async listByClinic(req: any, res: Response, next: NextFunction) {
        try {
            const doctors = await DoctorsService.listDoctorsInClinic(req.params.clinicId, req.user.userId);
            return successResponse(res, doctors, 'Doctors fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async getDetails(req: any, res: Response, next: NextFunction) {
        try {
            const doctor = await DoctorsService.getDoctorDetails(req.params.doctorId, req.user.userId);
            return successResponse(res, doctor, 'Doctor details fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async update(req: any, res: Response, next: NextFunction) {
        try {
            const profile = await DoctorsService.updateProfile(req.params.doctorId, req.user.userId, req.body);
            return successResponse(res, profile, 'Doctor profile updated successfully');
        } catch (error) {
            next(error);
        }
    }

    static async toggleStatus(req: any, res: Response, next: NextFunction) {
        try {
            const profile = await DoctorsService.toggleStatus(req.params.doctorId, req.user.userId, req.body);
            const statusMsg = profile.isActive ? 'enabled' : 'disabled';
            return successResponse(res, profile, `Doctor ${statusMsg} successfully`);
        } catch (error) {
            next(error);
        }
    }
    static async checkAvailability(req: any, res: Response, next: NextFunction) {
        try {
            const availability = await DoctorsService.getAvailability(req.params.doctorId);
            return successResponse(res, availability, 'Doctor availability checked successfully');
        } catch (error) {
            next(error);
        }
    }
}
