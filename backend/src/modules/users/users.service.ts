import prisma from '../../database/prisma';

export class UsersService {
    static async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async updateProfile(userId: string, data: { name?: string; phone?: string }) {
        const user = await prisma.user.update({
            where: { id: userId },
            data,
        });

        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
