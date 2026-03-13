import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimitMiddleware } from './middleware/rateLimit.middleware';
import { errorMiddleware } from './middleware/error.middleware';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import clinicRoutes from './modules/clinics/clinics.routes';
import doctorRoutes from './modules/doctors/doctors.routes';
import tokenRoutes from './modules/tokens/tokens.routes';
import patientRoutes from './modules/patients/patients.routes';
import scheduleRoutes from './modules/schedules/schedules.routes';
import clinicWorkingHoursRoutes from './modules/clinicWorkingHours/clinicWorkingHours.routes';

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimitMiddleware);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Routes initialization
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/clinics', clinicRoutes);
app.use('/api/v1', doctorRoutes); // Doctor routes use mixed prefixes as per requirements
app.use('/api/v1', tokenRoutes);
app.use('/api/v1', patientRoutes);
app.use('/api/v1', scheduleRoutes);
app.use('/api/v1', clinicWorkingHoursRoutes);

// Error Handler
app.use(errorMiddleware);

export default app;
