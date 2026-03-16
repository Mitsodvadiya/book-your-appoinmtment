import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../database/prisma';
import { env } from '../../config/env';
import { JWTPayload, LoginInput, RegisterInput, AuthTokens } from './auth.types';
import { UserRole } from '@prisma/client';
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
    },
});

export class AuthService {
    private static generateTokens(payload: JWTPayload): AuthTokens {
        const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }

    static async register(input: RegisterInput) {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: input.email }, { phone: input.phone }],
            },
        });

        if (existingUser) {
            throw { status: 409, message: 'User with this email or phone already exists' };
        }

        const passwordHash = await bcrypt.hash(input.password, 10);
        const role = input.role ?? UserRole.PATIENT;

        const user = await prisma.user.create({
            data: {
                name: input.name,
                email: input.email,
                phone: input.phone,
                passwordHash,
                role: role,
            },
        });

        const tokens = this.generateTokens({ userId: user.id, role: user.role });
        const fullUser = await this.getMe(user.id);

        return {
            user: fullUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    static async login(input: LoginInput) {
        const user = await prisma.user.findUnique({
            where: { email: input.email },
        });

        if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
            throw { status: 401, message: 'Invalid email or password' };
        }

        if (!user.status) {
            throw { status: 403, message: 'Your account has been deactivated. Please contact your clinic administrator for access.' };
        }

        const tokens = this.generateTokens({ userId: user.id, role: user.role });
        const fullUser = await this.getMe(user.id);

        return {
            user: fullUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    static async refreshToken(token: string) {
        try {
            const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
            const fullUser = await this.getMe(payload.userId);
            
            const tokens = this.generateTokens({ userId: payload.userId, role: payload.role });
            return {
                ...tokens,
                user: fullUser,
            };
        } catch (error) {
            throw { status: 401, message: 'Invalid or expired refresh token' };
        }
    }

    static async changePassword(userId: string, oldPass: string, newPass: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !(await bcrypt.compare(oldPass, user.passwordHash))) {
            throw { status: 401, message: 'Incorrect old password' };
        }

        const newPasswordHash = await bcrypt.hash(newPass, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
    }

    static async forgotPassword(email: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return;
        }

        const resetToken = jwt.sign({ userId: user.id, action: 'reset-password' }, env.JWT_SECRET, { expiresIn: '1m' });
        console.log(`Password reset token for ${email}: ${resetToken}`);
        
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        
        try {
            await transporter.sendMail({
                from: env.EMAIL_FROM,
                to: email,
                subject: 'Password Reset Request',
                text: `You requested a password reset. Click the link to reset your password (link expires in 1 minute): ${resetLink}`,
                html: `<p>You requested a password reset. Click the link below to reset your password (link expires in 1 minute):</p><p><a href="${resetLink}">Reset Password</a></p>`,
            });
            console.log(`Reset email sent to ${email}`);
        } catch (error) {
            console.error('Failed to send reset email', error);
            throw { status: 500, message: 'Failed to send reset email' };
        }

        return resetToken;
    }

    static async resetPassword(token: string, newPass: string) {
        try {
            const payload = jwt.verify(token, env.JWT_SECRET) as any;
            if (payload.action !== 'reset-password') throw new Error();

            const newPasswordHash = await bcrypt.hash(newPass, 10);
            await prisma.user.update({
                where: { id: payload.userId },
                data: { passwordHash: newPasswordHash },
            });
        } catch (error) {
            throw { status: 401, message: 'Invalid or expired reset token' };
        }
    }

    static async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                clinicMembers: {
                    include: {
                        clinic: true,
                    },
                    take: 1
                },
                doctorProfile: true,
            },
        });

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        if (!user.status) {
            throw { status: 403, message: 'Your account has been deactivated.' };
        }

        const { passwordHash: _, clinicMembers, ...userWithoutPassword } = user;
        const clinicMember = clinicMembers[0];

        return {
            ...userWithoutPassword,
            clinic: clinicMember ? clinicMember.clinic : null,
            roleInClinic: clinicMember ? clinicMember.role : null,
            doctorProfile: user.doctorProfile || null,
        };
    }
}
