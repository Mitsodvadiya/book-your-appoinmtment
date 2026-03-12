import prisma from '../../database/prisma';
import { CreateClinicInput, UpdateClinicInput, InviteStaffInput } from './clinics.types';
import { ClinicRole } from '@prisma/client';
import bcrypt from 'bcrypt';

export class ClinicsService {
    static async createClinic(userId: string, input: CreateClinicInput) {
        return await prisma.$transaction(async (tx: any) => {
            const clinic = await tx.clinic.create({
                data: input,
            });

            await tx.clinicMember.create({
                data: {
                    clinicId: clinic.id,
                    userId,
                    role: ClinicRole.CLINIC_ADMIN,
                },
            });

            return clinic;
        });
    }

    static async getClinics(city?: string) {
        return await prisma.clinic.findMany({
            where: {
                isActive: true,
                ...(city && { city: { contains: city, mode: 'insensitive' } }),
            },
        });
    }

    static async getClinicDetails(clinicId: string) {
        const clinic = await prisma.clinic.findUnique({
            where: { id: clinicId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!clinic) {
            throw { status: 404, message: 'Clinic not found' };
        }

        const members = clinic.members.map((m: any) => ({
            userId: m.user.id,
            name: m.user.name,
            email: m.user.email,
            role: m.role,
        }));

        const doctors = members.filter((m: any) => m.role === ClinicRole.DOCTOR);

        return {
            ...clinic,
            members,
            doctors,
        };
    }

    static async updateClinic(clinicId: string, userId: string, input: UpdateClinicInput) {
        // RBAC: Check if user is CLINIC_ADMIN
        const membership = await prisma.clinicMember.findUnique({
            where: {
                clinicId_userId: { clinicId, userId },
            },
        });

        if (!membership || membership.role !== ClinicRole.CLINIC_ADMIN) {
            throw { status: 403, message: 'Only clinic admins can update clinic details' };
        }

        return await prisma.clinic.update({
            where: { id: clinicId },
            data: input,
        });
    }

    static async inviteStaff(clinicId: string, adminId: string, input: InviteStaffInput) {
        // RBAC check
        const membership = await prisma.clinicMember.findUnique({
            where: {
                clinicId_userId: { clinicId, userId: adminId },
            },
        });

        if (!membership || membership.role !== ClinicRole.CLINIC_ADMIN) {
            throw { status: 403, message: 'Only clinic admins can invite staff' };
        }

        let user = await prisma.user.findUnique({
            where: { email: input.email },
        });

        if (!user) {
            // Create a skeleton user
            const placeholderPassword = await bcrypt.hash('Welcome@123', 10);
            user = await prisma.user.create({
                data: {
                    email: input.email,
                    name: input.email.split('@')[0], // Placeholder name
                    phone: `TEMP_${Date.now()}`, // Placeholder phone
                    passwordHash: placeholderPassword,
                    role: 'PATIENT', // Global role
                },
            });
        }

        return await prisma.clinicMember.create({
            data: {
                clinicId,
                userId: user.id,
                role: input.role as ClinicRole,
            },
        });
    }

    static async getMembers(clinicId: string, userId: string) {
        // Verify user belongs to clinic
        const membership = await prisma.clinicMember.findUnique({
            where: {
                clinicId_userId: { clinicId, userId },
            },
        });

        if (!membership) {
            throw { status: 403, message: 'Unauthorized: You are not a member of this clinic' };
        }

        const members = await prisma.clinicMember.findMany({
            where: { clinicId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return members.map((m: any) => ({
            userId: m.user.id,
            name: m.user.name,
            email: m.user.email,
            role: m.role,
        }));
    }
}
