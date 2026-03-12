import prisma from '../../database/prisma';
import { AddDoctorInput, UpdateDoctorInput, ToggleStatusInput } from './doctors.types';
import { ClinicRole, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

export class DoctorsService {
    static async addDoctor(clinicId: string, adminId: string, input: AddDoctorInput) {
        // 1. RBAC Check: Is current user CLINIC_ADMIN?
        const adminMembership = await prisma.clinicMember.findUnique({
            where: {
                clinicId_userId: { clinicId, userId: adminId },
            },
        });

        if (!adminMembership || adminMembership.role !== ClinicRole.CLINIC_ADMIN) {
            throw { status: 403, message: 'Only clinic admins can add doctors' };
        }

        // 2. Check if clinic exists
        const clinic = await prisma.clinic.findUnique({
            where: { id: clinicId },
        });

        if (!clinic) {
            throw { status: 404, message: 'Clinic not found' };
        }

        return await prisma.$transaction(async (tx: any) => {
            // 3. Find or Create User
            let user = await tx.user.findUnique({
                where: { email: input.email },
            });

            if (!user) {
                const passwordHash = await bcrypt.hash('Welcome@123', 10); // Standard starting password
                user = await tx.user.create({
                    data: {
                        name: input.name,
                        email: input.email,
                        phone: input.phone,
                        passwordHash,
                        role: UserRole.PATIENT, // Global role remains PATIENT or can be updated
                    },
                });
            }

            // 4. Add to Clinic Members
            const existingMembership = await tx.clinicMember.findUnique({
                where: {
                    clinicId_userId: { clinicId, userId: user.id },
                },
            });

            if (existingMembership) {
                if (existingMembership.role === ClinicRole.DOCTOR) {
                    throw { status: 400, message: 'User is already a doctor in this clinic' };
                }
                // If they were staff, upgrade to doctor? Requirement says insert record.
                // Usually, a user has one role per clinic.
                await tx.clinicMember.update({
                    where: { id: existingMembership.id },
                    data: { role: ClinicRole.DOCTOR },
                });
            } else {
                await tx.clinicMember.create({
                    data: {
                        clinicId,
                        userId: user.id,
                        role: ClinicRole.DOCTOR,
                    },
                });
            }

            // 5. Create or Get Doctor Profile
            let doctorProfile = await tx.doctorProfile.findUnique({
                where: { userId: user.id },
            });

            if (!doctorProfile) {
                doctorProfile = await tx.doctorProfile.create({
                    data: {
                        userId: user.id,
                        specialization: input.specialization,
                        consultationDuration: input.consultationDuration,
                        maxTokensPerDay: input.maxTokensPerDay,
                    },
                });
            }

            return {
                userId: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                ...doctorProfile,
            };
        });
    }

    static async listDoctorsInClinic(clinicId: string, userId: string) {
        // Verify requestor belongs to clinic
        const membership = await prisma.clinicMember.findUnique({
            where: {
                clinicId_userId: { clinicId, userId },
            },
        });

        if (!membership) {
            throw { status: 403, message: 'Unauthorized: You are not a member of this clinic' };
        }

        const members = await prisma.clinicMember.findMany({
            where: {
                clinicId,
                role: ClinicRole.DOCTOR,
            },
            include: {
                user: {
                    include: {
                        doctorProfile: true,
                    },
                },
            },
        });

        return members
            .filter((m: any) => m.user.doctorProfile) // Only those with profiles
            .map((m: any) => ({
                doctorId: m.user.doctorProfile.id,
                userId: m.user.id,
                name: m.user.name,
                email: m.user.email,
                phone: m.user.phone,
                specialization: m.user.doctorProfile.specialization,
                consultationDuration: m.user.doctorProfile.consultationDuration,
                maxTokensPerDay: m.user.doctorProfile.maxTokensPerDay,
                isActive: m.user.doctorProfile.isActive,
            }));
    }

    static async getDoctorDetails(doctorId: string, requestorId: string) {
        const profile = await prisma.doctorProfile.findUnique({
            where: { id: doctorId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!profile) {
            throw { status: 404, message: 'Doctor profile not found' };
        }

        // Authorization: "Doctors can only view their own profile."
        // Also Staff can view if they are in the same clinic.
        if (profile.userId !== requestorId) {
            // Check if requestor shares any clinic with this doctor
            const doctorClinics = await prisma.clinicMember.findMany({
                where: { userId: profile.userId, role: ClinicRole.DOCTOR },
                select: { clinicId: true },
            });

            const shareClinic = await prisma.clinicMember.findFirst({
                where: {
                    userId: requestorId,
                    clinicId: { in: doctorClinics.map((c: any) => c.clinicId) },
                },
            });

            if (!shareClinic) {
                throw { status: 403, message: 'Unauthorized: You do not have access to this doctor profile' };
            }
        }

        return {
            name: profile.user.name,
            email: profile.user.email,
            phone: profile.user.phone,
            specialization: profile.specialization,
            consultationDuration: profile.consultationDuration,
            maxTokensPerDay: profile.maxTokensPerDay,
            createdAt: profile.createdAt,
        };
    }

    static async updateProfile(doctorId: string, adminId: string, input: UpdateDoctorInput) {
        // RBAC: Need to find which clinic this doctor belongs to and check if adminId is admin there
        // For simplicity, we can assume the user is an admin of at least one clinic the doctor is in
        // or just check if the doctor profile exists.
        // The requirement says "Only CLINIC_ADMIN can update doctor".
        const profile = await prisma.doctorProfile.findUnique({
            where: { id: doctorId },
        });

        if (!profile) {
            throw { status: 404, message: 'Doctor profile not found' };
        }

        // Find clinics where this doctor works
        const memberships = await prisma.clinicMember.findMany({
            where: { userId: profile.userId, role: ClinicRole.DOCTOR },
        });

        // Check if adminId is CLINIC_ADMIN in any of those clinics
        const adminCheck = await prisma.clinicMember.findFirst({
            where: {
                userId: adminId,
                role: ClinicRole.CLINIC_ADMIN,
                clinicId: { in: memberships.map((m: any) => m.clinicId) },
            },
        });

        if (!adminCheck) {
            throw { status: 403, message: 'Unauthorized: You are not an admin of a clinic this doctor belongs to' };
        }

        return await prisma.doctorProfile.update({
            where: { id: doctorId },
            data: input,
        });
    }

    static async toggleStatus(doctorId: string, adminId: string, input: ToggleStatusInput) {
        const profile = await prisma.doctorProfile.findUnique({
            where: { id: doctorId },
        });

        if (!profile) {
            throw { status: 404, message: 'Doctor profile not found' };
        }

        // RBAC check (same as update)
        const memberships = await prisma.clinicMember.findMany({
            where: { userId: profile.userId, role: ClinicRole.DOCTOR },
        });

        const adminCheck = await prisma.clinicMember.findFirst({
            where: {
                userId: adminId,
                role: ClinicRole.CLINIC_ADMIN,
                clinicId: { in: memberships.map((m: any) => m.clinicId) },
            },
        });

        if (!adminCheck) {
            throw { status: 403, message: 'Unauthorized: You are not an admin of a clinic this doctor belongs to' };
        }

        return await prisma.doctorProfile.update({
            where: { id: doctorId },
            data: { isActive: input.isActive },
        });
    }

    static async getAvailability(doctorId: string) {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0-6

        const schedule = await prisma.doctorSchedule.findFirst({
            where: {
                doctorId,
                dayOfWeek,
                isActive: true,
            }
        });

        if (!schedule) {
            return { isAvailable: false, nextAvailableDay: 'Contact Clinic' };
        }

        const currentTime = today.getHours() * 60 + today.getMinutes();
        const startTotal = schedule.startTime.getHours() * 60 + schedule.startTime.getMinutes();
        const endTotal = schedule.endTime.getHours() * 60 + schedule.endTime.getMinutes();

        const isAvailable = currentTime >= startTotal && currentTime <= endTotal;

        return {
            isAvailable,
            schedule: {
                startTime: schedule.startTime,
                endTime: schedule.endTime
            }
        };
    }
}
