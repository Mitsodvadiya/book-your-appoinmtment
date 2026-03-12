import { Response, NextFunction } from 'express';
import { PatientsService } from './patients.service';
import { successResponse } from '../../utils/response';

export class PatientsController {
    static async create(req: any, res: Response, next: NextFunction) {
        try {
            const patient = await PatientsService.createPatient(
                req.params.clinicId,
                req.user.userId,
                req.body
            );
            return successResponse(res, patient, 'Patient registered successfully');
        } catch (error) {
            next(error);
        }
    }

    static async list(req: any, res: Response, next: NextFunction) {
        try {
            const patients = await PatientsService.listPatients(req.params.clinicId);
            return successResponse(res, patients, 'Patients fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async getOne(req: any, res: Response, next: NextFunction) {
        try {
            const patient = await PatientsService.getPatientById(req.params.id);
            return successResponse(res, patient, 'Patient details fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async search(req: any, res: Response, next: NextFunction) {
        try {
            const query = req.query.q as string;
            const patients = await PatientsService.searchPatients(req.params.clinicId, query);
            return successResponse(res, patients, 'Patients searched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async update(req: any, res: Response, next: NextFunction) {
        try {
            const patient = await PatientsService.updatePatient(req.params.id, req.body);
            return successResponse(res, patient, 'Patient updated successfully');
        } catch (error) {
            next(error);
        }
    }

    static async toggleStatus(req: any, res: Response, next: NextFunction) {
        try {
            const patient = await PatientsService.toggleStatus(req.params.id, req.body.isActive);
            const statusMsg = patient.isActive ? 'enabled' : 'disabled';
            return successResponse(res, patient, `Patient ${statusMsg} successfully`);
        } catch (error) {
            next(error);
        }
    }
}
