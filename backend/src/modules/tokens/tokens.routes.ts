import { Router } from 'express';
import { TokensController } from './tokens.controller';
import { authenticateUser } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { generateTokenSchema, doctorIdParamSchema, tokenIdParamSchema } from './tokens.schema';

const router = Router();

// Patient routes
router.post(
    '/tokens',
    authenticateUser,
    validate(generateTokenSchema),
    TokensController.generate
);

// Doctor/Staff routes
router.get(
    '/doctors/:doctorId/current-token',
    authenticateUser,
    validate(doctorIdParamSchema),
    TokensController.getCurrent
);

router.get(
    '/doctors/:doctorId/queue',
    authenticateUser,
    validate(doctorIdParamSchema),
    TokensController.getQueue
);

router.post(
    '/tokens/next',
    authenticateUser,
    TokensController.callNext
);

router.patch(
    '/tokens/:tokenId/skip',
    authenticateUser,
    validate(tokenIdParamSchema),
    TokensController.skip
);

router.patch(
    '/tokens/:tokenId/cancel',
    authenticateUser,
    validate(tokenIdParamSchema),
    TokensController.cancel
);

router.get(
    '/patients/:patientId/tokens',
    authenticateUser,
    TokensController.getPatientTokens
);

router.get(
    '/tokens/:tokenId',
    authenticateUser,
    validate(tokenIdParamSchema),
    TokensController.getOne
);

router.get(
    '/display/:clinicId/:doctorId',
    TokensController.getDisplay // Publicly readable for waiting room boards
);

export default router;
