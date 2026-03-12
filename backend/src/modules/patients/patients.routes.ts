import { Router } from 'express';
import { PatientsController } from './patients.controller';
import { authenticateUser } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createPatientSchema, updatePatientSchema, togglePatientStatusSchema } from './patients.schema';

const router = Router();

router.post(
    '/clinics/:clinicId/patients',
    authenticateUser,
    validate(createPatientSchema),
    PatientsController.create
);

router.get(
    '/clinics/:clinicId/patients/search',
    authenticateUser,
    PatientsController.search
);

router.get(
    '/clinics/:clinicId/patients',
    authenticateUser,
    PatientsController.list
);

router.get(
    '/patients/:id',
    authenticateUser,
    PatientsController.getOne
);

router.patch(
    '/patients/:id',
    authenticateUser,
    validate(updatePatientSchema),
    PatientsController.update
);

router.patch(
    '/patients/:id/status',
    authenticateUser,
    validate(togglePatientStatusSchema),
    PatientsController.toggleStatus
);

export default router;
