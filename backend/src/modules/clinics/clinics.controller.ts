import { Response, NextFunction } from 'express';
import { ClinicsService } from './clinics.service';
import { successResponse } from '../../utils/response';

export class ClinicsController {
    static async create(req: any, res: Response, next: NextFunction) {
        try {
            const clinic = await ClinicsService.createClinic(req.user.userId, req.body);
            return successResponse(res, clinic, 'Clinic created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req: any, res: Response, next: NextFunction) {
        try {
            const city = req.query.city as string;
            const clinics = await ClinicsService.getClinics(city);
            return successResponse(res, clinics, 'Clinics fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async getDetails(req: any, res: Response, next: NextFunction) {
        try {
            const clinic = await ClinicsService.getClinicDetails(req.params.clinicId);
            return successResponse(res, clinic, 'Clinic details fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async update(req: any, res: Response, next: NextFunction) {
        try {
            const clinic = await ClinicsService.updateClinic(req.params.clinicId, req.user.userId, req.body);
            return successResponse(res, clinic, 'Clinic updated successfully');
        } catch (error) {
            next(error);
        }
    }

    static async invite(req: any, res: Response, next: NextFunction) {
        try {
            const membership = await ClinicsService.inviteStaff(req.params.clinicId, req.user.userId, req.body);
            return successResponse(res, membership, 'Staff invited successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    static async getMembers(req: any, res: Response, next: NextFunction) {
        try {
            const members = await ClinicsService.getMembers(req.params.clinicId, req.user.userId);
            return successResponse(res, members, 'Clinic members fetched successfully');
        } catch (error) {
            next(error);
        }
    }
}
