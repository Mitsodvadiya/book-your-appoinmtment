import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticateUser } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateProfileSchema } from './users.schema';
import { profileUpdateLimiter } from '../../middleware/rate-limit.middleware';

const router = Router();

router.get('/profile', authenticateUser, UsersController.getProfile);
router.patch('/profile', authenticateUser, profileUpdateLimiter, validate(updateProfileSchema), UsersController.updateProfile);

export default router;
