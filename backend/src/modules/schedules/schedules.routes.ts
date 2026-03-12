import { Router } from 'express';
import { SchedulesController } from './schedules.controller';
import { authenticateUser } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createScheduleSchema, updateScheduleSchema } from './schedules.schema';

const router = Router();

// Doctor specific schedule management
router.post(
    '/doctors/:doctorId/schedules',
    authenticateUser,
    validate(createScheduleSchema),
    SchedulesController.create
);

router.get(
    '/doctors/:doctorId/schedules',
    authenticateUser,
    SchedulesController.list
);

// Generic schedule management by ID
router.patch(
    '/schedules/:scheduleId',
    authenticateUser,
    validate(updateScheduleSchema),
    SchedulesController.update
);

router.delete(
    '/schedules/:scheduleId',
    authenticateUser,
    SchedulesController.delete
);

export default router;
