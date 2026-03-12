import { Response, NextFunction } from 'express';
import { TokensService } from './tokens.service';
import { successResponse } from '../../utils/response';
import { TokenStatus } from '@prisma/client';

export class TokensController {
    static async generate(req: any, res: Response, next: NextFunction) {
        try {
            const token = await TokensService.generateToken(req.body);
            return successResponse(res, token, 'Token generated successfully');
        } catch (error) {
            next(error);
        }
    }

    static async getCurrent(req: any, res: Response, next: NextFunction) {
        try {
            const token = await TokensService.getCurrentToken(req.params.doctorId);
            return successResponse(res, token, 'Current token fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async getQueue(req: any, res: Response, next: NextFunction) {
        try {
            const queue = await TokensService.getQueue(req.params.doctorId);
            return successResponse(res, queue, 'Queue fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async callNext(req: any, res: Response, next: NextFunction) {
        try {
            const token = await TokensService.callNext(req.body.doctorId, req.user.userId);
            return successResponse(res, token, token ? 'Next token called successfully' : 'No tokens in queue');
        } catch (error) {
            next(error);
        }
    }

    static async skip(req: any, res: Response, next: NextFunction) {
        try {
            const token = await TokensService.updateStatus(req.params.tokenId, req.user.userId, TokenStatus.SKIPPED);
            return successResponse(res, token, 'Token skipped successfully');
        } catch (error) {
            next(error);
        }
    }

    static async cancel(req: any, res: Response, next: NextFunction) {
        try {
            const token = await TokensService.updateStatus(req.params.tokenId, req.user.userId, TokenStatus.CANCELLED);
            return successResponse(res, token, 'Token cancelled successfully');
        } catch (error) {
            next(error);
        }
    }

    static async getPatientTokens(req: any, res: Response, next: NextFunction) {
        try {
            const tokens = await TokensService.getPatientTokens(req.params.patientId);
            return successResponse(res, tokens, 'Patient tokens fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async getOne(req: any, res: Response, next: NextFunction) {
        try {
            const token = await TokensService.getTokenById(req.params.tokenId);
            return successResponse(res, token, 'Token details fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async getDisplay(req: any, res: Response, next: NextFunction) {
        try {
            const data = await TokensService.getDisplayData(req.params.clinicId, req.params.doctorId);
            return successResponse(res, data, 'Display data fetched successfully');
        } catch (error) {
            next(error);
        }
    }
}
