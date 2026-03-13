import { Router } from 'express';
import { ClinicWorkingHoursController } from './clinicWorkingHours.controller';
import { authenticateUser } from '../auth/auth.middleware';

const router = Router();

// Save working hours (used during onboarding Step 2)
router.post('/clinics/:clinicId/working-hours', authenticateUser, ClinicWorkingHoursController.saveWorkingHours);

// Get working hours
router.get('/clinics/:clinicId/working-hours', authenticateUser, ClinicWorkingHoursController.getWorkingHours);

export default router;
