import { Router } from 'express';
import { DoctorsController } from './doctors.controller';
import { authenticateUser } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { addDoctorSchema, updateDoctorSchema, toggleStatusSchema } from './doctors.schema';

const router = Router();

// Clinic specific doctor management
router.post('/clinics/:clinicId/doctors', authenticateUser, validate(addDoctorSchema), DoctorsController.add);
router.get('/clinics/:clinicId/doctors', authenticateUser, DoctorsController.listByClinic);

// Generic doctor profile management
router.get('/doctors/:doctorId', authenticateUser, DoctorsController.getDetails);
router.patch('/doctors/:doctorId', authenticateUser, validate(updateDoctorSchema), DoctorsController.update);
router.patch('/doctors/:doctorId/status', authenticateUser, validate(toggleStatusSchema), DoctorsController.toggleStatus);

router.get('/doctors/:doctorId/availability', authenticateUser, DoctorsController.checkAvailability);

export default router;
