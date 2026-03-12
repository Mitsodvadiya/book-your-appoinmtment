import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../database/prisma';
import { env } from '../../config/env';
import { JWTPayload, LoginInput, RegisterInput, AuthTokens } from './auth.types';
import { UserRole } from '@prisma/client';

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

        const user = await prisma.user.create({
            data: {
                name: input.name,
                email: input.email,
                phone: input.phone,
                passwordHash,
                role: UserRole.PATIENT,
            },
        });

        // Generate tokens immediately so the frontend can use them for next steps
        const tokens = this.generateTokens({ userId: user.id, role: user.role });

        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
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

        const tokens = this.generateTokens({ userId: user.id, role: user.role });

        // Check if user has a clinic
        const clinicMember = await prisma.clinicMember.findFirst({
            where: { userId: user.id },
            include: {
                clinic: true,
            },
        });

        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: userWithoutPassword,
            clinic: clinicMember ? clinicMember.clinic : false,
        };
    }

    static async refreshToken(token: string) {
        try {
            const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
            return this.generateTokens({ userId: payload.userId, role: payload.role });
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

        const resetToken = jwt.sign({ userId: user.id, action: 'reset-password' }, env.JWT_SECRET, { expiresIn: '15m' });
        console.log(`Password reset token for ${email}: ${resetToken}`);
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
}
