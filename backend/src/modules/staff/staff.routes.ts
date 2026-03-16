import { Router } from 'express';
import { StaffController } from './staff.controller';
import { authenticateUser } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { addStaffSchema, updateStaffSchema, toggleStaffStatusSchema } from './staff.schema';

const router = Router();

// Clinic specific staff/doctor management
router.post('/clinics/:clinicId/staff', authenticateUser, validate(addStaffSchema), StaffController.add);
router.get('/clinics/:clinicId/staff', authenticateUser, StaffController.listByClinic);

// Generic staff management
router.patch('/staff/:userId', authenticateUser, validate(updateStaffSchema), StaffController.update);
router.patch('/staff/:userId/status', authenticateUser, validate(toggleStaffStatusSchema), StaffController.toggleStatus);

export default router;
