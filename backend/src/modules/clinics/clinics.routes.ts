import { Router } from 'express';
import { ClinicsController } from './clinics.controller';
import { authenticateUser } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createClinicSchema, updateClinicSchema, inviteStaffSchema } from './clinics.schema';

const router = Router();

// Publicly readable clinics (authenticated users)
router.get('/', authenticateUser, ClinicsController.getAll);
router.get('/:clinicId', authenticateUser, ClinicsController.getDetails);

// Manage clinics
router.post('/', authenticateUser, validate(createClinicSchema), ClinicsController.create);
router.patch('/:clinicId', authenticateUser, validate(updateClinicSchema), ClinicsController.update);

// Staff management
router.post('/:clinicId/invite', authenticateUser, validate(inviteStaffSchema), ClinicsController.invite);
router.get('/:clinicId/members', authenticateUser, ClinicsController.getMembers);

export default router;
