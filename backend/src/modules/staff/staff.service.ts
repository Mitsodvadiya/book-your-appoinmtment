import prisma from '../../database/prisma';
import { AddStaffInput, UpdateStaffInput, ToggleStaffStatusInput } from './staff.types';
import { ClinicRole, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { transporter } from '../auth/auth.service';

export class StaffService {
    static async addStaff(clinicId: string, adminId: string, input: AddStaffInput) {
        // 1. RBAC Check: Is current user CLINIC_ADMIN?
        const adminMembership = await prisma.clinicMember.findUnique({
            where: {
                clinicId_userId: { clinicId, userId: adminId },
            },
        });

        if (!adminMembership || adminMembership.role !== ClinicRole.CLINIC_ADMIN) {
            throw { status: 403, message: 'Only clinic admins can manage staff and doctors' };
        }

        // 2. Check if clinic exists
        const clinic = await prisma.clinic.findUnique({
            where: { id: clinicId },
        });

        if (!clinic) {
            throw { status: 404, message: 'Clinic not found' };
        }

        const result = await prisma.$transaction(async (tx: any) => {
            let user = await tx.user.findFirst({
                where: { 
                    OR: [
                        { email: input.email },
                        { phone: input.phone }
                    ]
                },
            });

            let isNewUser = false;

            if (!user) {
                const passwordHash = await bcrypt.hash('Welcome@123', 10); 
                
                let assignedGlobalRole: UserRole = UserRole.PATIENT;
                if (input.role === ClinicRole.CLINIC_ADMIN) assignedGlobalRole = UserRole.CLINIC_ADMIN;
                else if (input.role === ClinicRole.DOCTOR) assignedGlobalRole = UserRole.DOCTOR;
                else if (input.role === ClinicRole.STAFF) assignedGlobalRole = UserRole.STAFF;

                user = await tx.user.create({
                    data: {
                        name: input.name,
                        email: input.email,
                        phone: input.phone,
                        passwordHash,
                        role: assignedGlobalRole, 
                    },
                });
                isNewUser = true;
            } else {
                if (user.email !== input.email) {
                    throw { status: 400, message: 'A user with this phone number is already registered under a different email.' };
                }
                if (user.phone !== input.phone) {
                    throw { status: 400, message: 'A user with this email is already registered under a different phone number.' };
                }
            }

            // 4. Add to Clinic Members
            const existingMembership = await tx.clinicMember.findUnique({
                where: {
                    clinicId_userId: { clinicId, userId: user.id },
                },
            });

            if (existingMembership) {
                await tx.clinicMember.update({
                    where: { id: existingMembership.id },
                    data: { role: input.role },
                });
            } else {
                await tx.clinicMember.create({
                    data: {
                        clinicId,
                        userId: user.id,
                        role: input.role,
                    },
                });
            }

            // 5. Build DOCTOR metadata profile if the assigned role dictates it
            let doctorProfile = null;
            if (input.role === ClinicRole.DOCTOR) {
                doctorProfile = await tx.doctorProfile.findUnique({
                    where: { userId: user.id },
                });

                if (!doctorProfile) {
                    doctorProfile = await tx.doctorProfile.create({
                        data: {
                            userId: user.id,
                            specialization: input.specialization || 'General',
                            consultationDuration: input.consultationDuration || 15,
                            maxTokensPerDay: input.maxTokensPerDay || 40,
                        },
                    });
                } else {
                    doctorProfile = await tx.doctorProfile.update({
                        where: { id: doctorProfile.id },
                        data: {
                            specialization: input.specialization || doctorProfile.specialization,
                            consultationDuration: input.consultationDuration || doctorProfile.consultationDuration,
                            maxTokensPerDay: input.maxTokensPerDay || doctorProfile.maxTokensPerDay,
                        }
                    });
                }
            }

            return {
                userId: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: input.role,
                isNewUser, // Expose initialization parameter
                ...(doctorProfile ? { doctorProfile } : {})
            };
        });

        // 6. Non-blocking Post Transaction Side Effects
        if (result.isNewUser) {
            try {
                const resetToken = jwt.sign({ userId: result.userId, action: 'reset-password' }, env.JWT_SECRET, { expiresIn: '15m' });
                const inviteLink = `http://localhost:3000/setup-password?token=${resetToken}`;
                
                await transporter.sendMail({
                    from: env.EMAIL_FROM,
                    to: result.email,
                    subject: `Welcome to ClinicQueue - Set up your ${clinic.name} account`,
                    text: `You have been added to ${clinic.name} on ClinicQueue. Please click the link to setup your account password: ${inviteLink}`,
                    html: `<p>You have been added to <b>${clinic.name}</b> on ClinicQueue.</p><p>Please click the link below to set a permanent password for your new account (link expires in 15 minutes):</p><p><a href="${inviteLink}">Setup Password</a></p>`,
                });
                console.log(`Initial Setup Email Sent -> ${result.email}`);
            } catch (err) {
                console.error('Failed to send setup email:', err);
            }
        }

        // Remove the `isNewUser` flag before sending output backwards to frontend Controller
        const { isNewUser, ...safeResult } = result;
        return safeResult;
    }

    static async listStaffInClinic(clinicId: string, requestorId: string) {
        // Verify requestor belongs to clinic (Must be admin per typical dashboard flows, though staffs could view each other)
        const membership = await prisma.clinicMember.findUnique({
            where: {
                clinicId_userId: { clinicId, userId: requestorId },
            },
        });

        if (!membership) {
            throw { status: 403, message: 'Unauthorized: You are not a member of this clinic' };
        }

        const members = await prisma.clinicMember.findMany({
            where: {
                clinicId,
            },
            include: {
                user: {
                    include: {
                        doctorProfile: true, // Only carries data if they are a DOCTOR
                    },
                },
            },
        });

        return members.map((m: any) => ({
            id: m.id,
            userId: m.user.id,
            name: m.user.name,
            email: m.user.email,
            phone: m.user.phone,
            role: m.role,
            isActive: m.user.status, // Primary global user status
            doctorProfile: m.role === 'DOCTOR' ? m.user.doctorProfile : undefined
        }));
    }

    static async updateStaffInfo(userId: string, adminId: string, input: UpdateStaffInput) {
        // Ensure requestor has administrative powers over clinics where this user exists
        const adminClinics = await prisma.clinicMember.findMany({
            where: { userId: adminId, role: ClinicRole.CLINIC_ADMIN },
            select: { clinicId: true },
        });

        const targetUserClinics = await prisma.clinicMember.findMany({
            where: { userId },
            select: { clinicId: true },
        });

        // Determine intersection 
        const sharedClinicIds = adminClinics.filter((adminMember: any) => 
            targetUserClinics.some((targetMember: any) => targetMember.clinicId === adminMember.clinicId)
        );

        if (sharedClinicIds.length === 0) {
            throw { status: 403, message: 'Unauthorized to modify this user' };
        }

        const userUpdates: any = {};
        if (input.name) userUpdates.name = input.name;
        if (input.phone) userUpdates.phone = input.phone;

        if (Object.keys(userUpdates).length > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: userUpdates
            });
        }

        // If the role changes, we only toggle it across the shared clinic scoping.
        // Assuming update goes purely to the FIRST shared clinic, or requires specific clinicId in params (future enhancement).
        if (input.role) {
             await prisma.clinicMember.update({
                 where: {
                     clinicId_userId: { clinicId: sharedClinicIds[0].clinicId, userId },
                 },
                 data: { role: input.role }
             })
        }

        return { message: "Information Successfully Updated" };
    }

    static async toggleStatus(userId: string, adminId: string, input: ToggleStaffStatusInput) {
        // Require identical administrative crossover logic
        const adminClinics = await prisma.clinicMember.findMany({
            where: { userId: adminId, role: ClinicRole.CLINIC_ADMIN },
            select: { clinicId: true },
        });

        const targetUserClinics = await prisma.clinicMember.findMany({
            where: { userId },
            select: { clinicId: true, role: true },
        });

        const isTargetAdmin = targetUserClinics.some(c => c.role === ClinicRole.CLINIC_ADMIN);
        if (isTargetAdmin) {
            throw { status: 403, message: 'Clinic Administrator accounts cannot be disabled.' };
        }

        const sharedClinicIds = adminClinics.filter((adminMember: any) => 
            targetUserClinics.some((targetMember: any) => targetMember.clinicId === adminMember.clinicId)
        );

        if (sharedClinicIds.length === 0) {
            throw { status: 403, message: 'Unauthorized to modify this user' };
        }

        return await prisma.user.update({
            where: { id: userId },
            data: { status: input.isActive },
        });
    }
}
