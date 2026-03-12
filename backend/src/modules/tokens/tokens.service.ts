import prisma from '../../database/prisma';
import { GenerateTokenInput, TokenResponse, QueueItem } from './tokens.types';
import { TokenStatus, TokenType, ClinicRole } from '@prisma/client';
import { emitTokenCreated, emitTokenNext, emitTokenSkipped, emitTokenCancelled } from '../../sockets/token.events';

export class TokensService {
    /**
     * Generates a new token for a patient.
     */
    static async generateToken(input: GenerateTokenInput): Promise<TokenResponse> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Verify doctor belongs to clinic
        const doctorMembership = await prisma.clinicMember.findUnique({
            where: {
                clinicId_userId: {
                    clinicId: input.clinicId,
                    userId: await this.getUserIdFromDoctorProfile(input.doctorId),
                },
            },
        });

        if (!doctorMembership || doctorMembership.role !== ClinicRole.DOCTOR) {
            throw { status: 400, message: 'Doctor does not belong to this clinic' };
        }

        // 2. Verify patient belongs to clinic
        const patient = await prisma.patient.findUnique({
            where: { id: input.patientId },
        });

        if (!patient || patient.clinicId !== input.clinicId) {
            throw { status: 400, message: 'Patient does not belong to this clinic' };
        }

        // 3. Get doctor's consultation duration
        const doctorProfile = await prisma.doctorProfile.findUnique({
            where: { id: input.doctorId },
        });

        if (!doctorProfile) {
            throw { status: 404, message: 'Doctor profile not found' };
        }

        const maxRetries = 3;
        let lastError: any;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await prisma.$transaction(async (tx: any) => {
                    // 4. Get last token number for today
                    const lastToken = await tx.token.findFirst({
                        where: {
                            doctorId: input.doctorId,
                            queueDate: today,
                        },
                        orderBy: { tokenNumber: 'desc' },
                    });

                    const nextTokenNumber = (lastToken?.tokenNumber || 0) + 1;

                    // 5. Calculate estimated wait time
                    // Find current token being served
                    const currentToken = await tx.token.findFirst({
                        where: {
                            doctorId: input.doctorId,
                            queueDate: today,
                            status: TokenStatus.IN_PROGRESS,
                        },
                    });

                    const currentNumber = currentToken?.tokenNumber || 0;
                    // The requirement says: tokensAhead = bookedToken - currentToken
                    // waitTime = tokensAhead * consultationDuration
                    const tokensAhead = nextTokenNumber - currentNumber;
                    const waitMinutes = Math.max(0, tokensAhead * doctorProfile.consultationDuration);

                    const estimatedTime = new Date();
                    estimatedTime.setMinutes(estimatedTime.getMinutes() + waitMinutes);

                    const token = await tx.token.create({
                        data: {
                            clinicId: input.clinicId,
                            doctorId: input.doctorId,
                            patientId: input.patientId,
                            tokenNumber: nextTokenNumber,
                            tokenType: input.tokenType,
                            status: TokenStatus.WAITING,
                            queueDate: today,
                            estimatedTime,
                        },
                    });

                    // Emit Real-time event
                    emitTokenCreated(input.clinicId, input.doctorId, nextTokenNumber);

                    return {
                        id: token.id,
                        tokenNumber: token.tokenNumber,
                        tokenType: token.tokenType,
                        status: token.status,
                        estimatedWaitMinutes: waitMinutes,
                        queueDate: token.queueDate,
                    };
                });
            } catch (error: any) {
                // If unique constraint violation, retry for next number
                if (error.code === 'P2002') {
                    lastError = error;
                    continue;
                }
                throw error;
            }
        }
        throw lastError;
    }

    /**
     * Returns the token currently being served.
     */
    static async getCurrentToken(doctorId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return await prisma.token.findFirst({
            where: {
                doctorId,
                queueDate: today,
                status: TokenStatus.IN_PROGRESS,
            },
            include: {
                patient: {
                    select: { name: true },
                },
            },
        });
    }

    /**
     * Returns the list of waiting tokens.
     */
    static async getQueue(doctorId: string): Promise<QueueItem[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tokens = await prisma.token.findMany({
            where: {
                doctorId,
                queueDate: today,
                status: TokenStatus.WAITING,
            },
            orderBy: { tokenNumber: 'asc' },
            include: {
                patient: {
                    select: { name: true },
                },
            },
        });

        return tokens.map((t) => ({
            id: t.id,
            tokenNumber: t.tokenNumber,
            patientName: t.patient.name,
            tokenType: t.tokenType,
            status: t.status,
            createdAt: t.createdAt,
        }));
    }

    /**
     * Moves the queue forward.
     */
    static async callNext(doctorId: string, adminId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Verify authorization (Clinic Admin, Staff, or the Doctor themselves)
        await this.verifyQueueManager(doctorId, adminId);

        return await prisma.$transaction(async (tx: any) => {
            // 1. Complete current token
            await tx.token.updateMany({
                where: {
                    doctorId,
                    queueDate: today,
                    status: TokenStatus.IN_PROGRESS,
                },
                data: { status: TokenStatus.COMPLETED },
            });

            // 2. Find next waiting token
            const nextToken = await tx.token.findFirst({
                where: {
                    doctorId,
                    queueDate: today,
                    status: TokenStatus.WAITING,
                },
                orderBy: { tokenNumber: 'asc' },
            });

            if (!nextToken) {
                return null;
            }

            // 3. Mark next as in progress
            const updatedToken = await tx.token.update({
                where: { id: nextToken.id },
                data: { status: TokenStatus.IN_PROGRESS },
                include: {
                    patient: {
                        select: { name: true },
                    },
                },
            });

            // Emit Real-time event
            emitTokenNext(updatedToken.clinicId, doctorId, updatedToken.tokenNumber);

            return updatedToken;
        });
    }

    /**
     * Skips or Cancels a token.
     */
    static async updateStatus(tokenId: string, userId: string, status: TokenStatus) {
        const token = await prisma.token.findUnique({
            where: { id: tokenId },
        });

        if (!token) {
            throw { status: 404, message: 'Token not found' };
        }

        // Role check: Only the patient themselves can cancel their own token.
        // Staff/Doctors can skip or cancel any.
        if (status === TokenStatus.CANCELLED) {
            // Check if it's the patient or a manager
            const isPatient = token.patientId === await this.getPatientIdFromUserId(userId, token.clinicId);
            if (!isPatient) {
                await this.verifyQueueManager(token.doctorId, userId);
            }
        } else {
            // For SKIPPED, must be manager
            await this.verifyQueueManager(token.doctorId, userId);
        }

        const updatedToken = await prisma.token.update({
            where: { id: tokenId },
            data: { status },
        });

        // Emit Real-time events
        if (status === TokenStatus.SKIPPED) {
            emitTokenSkipped(updatedToken.clinicId, updatedToken.doctorId, updatedToken.tokenNumber);
        } else if (status === TokenStatus.CANCELLED) {
            emitTokenCancelled(updatedToken.clinicId, updatedToken.doctorId, updatedToken.tokenNumber);
        }

        return updatedToken;
    }

    // --- Helpers ---

    private static async getUserIdFromDoctorProfile(doctorId: string): Promise<string> {
        const profile = await prisma.doctorProfile.findUnique({
            where: { id: doctorId },
            select: { userId: true },
        });
        if (!profile) throw { status: 404, message: 'Doctor profile not found' };
        return profile.userId;
    }

    private static async getPatientIdFromUserId(userId: string, clinicId: string): Promise<string | null> {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return null;

        const patient = await prisma.patient.findFirst({
            where: {
                clinicId,
                phone: user.phone,
            },
        });
        return patient?.id || null;
    }

    private static async verifyQueueManager(doctorId: string, userId: string) {
        const profile = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });
        if (!profile) throw { status: 404, message: 'Doctor profile not found' };

        // Find clinics this doctor belongs to
        const doctorMemberships = await prisma.clinicMember.findMany({
            where: { userId: profile.userId, role: ClinicRole.DOCTOR },
        });

        const clinicIds = doctorMemberships.map((m) => m.clinicId);

        // Check if current user is admin/staff/doctor in any of these clinics
        const membership = await prisma.clinicMember.findFirst({
            where: {
                userId,
                clinicId: { in: clinicIds },
                role: { in: [ClinicRole.CLINIC_ADMIN, ClinicRole.STAFF, ClinicRole.DOCTOR] },
            },
        });

        if (!membership) {
            throw { status: 403, message: 'Unauthorized to manage this queue' };
        }
    }

    static async getPatientTokens(patientId: string) {
        return await prisma.token.findMany({
            where: { patientId },
            orderBy: { queueDate: 'desc' },
            include: {
                doctor: {
                    select: {
                        specialization: true,
                        user: { select: { name: true } }
                    }
                },
                clinic: { select: { name: true } }
            }
        });
    }

    static async getTokenById(id: string) {
        const token = await prisma.token.findUnique({
            where: { id },
            include: {
                patient: { select: { name: true, phone: true } },
                doctor: {
                    select: {
                        specialization: true,
                        user: { select: { name: true } }
                    }
                },
                clinic: { select: { name: true, address: true, city: true } }
            }
        });
        if (!token) throw { status: 404, message: 'Token not found' };
        return token;
    }

    static async getDisplayData(clinicId: string, doctorId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [currentToken, waitingTokens] = await Promise.all([
            this.getCurrentToken(doctorId),
            prisma.token.findMany({
                where: {
                    clinicId,
                    doctorId,
                    queueDate: today,
                    status: TokenStatus.WAITING,
                },
                orderBy: { tokenNumber: 'asc' },
                take: 5, // Show next 5
                select: { tokenNumber: true }
            })
        ]);

        return {
            currentToken: currentToken?.tokenNumber || null,
            nextTokens: waitingTokens.map(t => t.tokenNumber),
            lastUpdated: new Date()
        };
    }
}
