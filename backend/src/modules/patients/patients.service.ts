import prisma from '../../database/prisma';
import { CreatePatientInput, UpdatePatientInput } from './patients.types';

export class PatientsService {
    static async createPatient(clinicId: string, createdBy: string, input: CreatePatientInput) {
        // Check if patient already exists in this clinic by phone
        const existingPatient = await prisma.patient.findUnique({
            where: {
                clinicId_phone: {
                    clinicId,
                    phone: input.phone,
                },
            },
        });

        if (existingPatient) {
            return existingPatient;
        }

        return await prisma.patient.create({
            data: {
                clinicId,
                createdBy,
                name: input.name,
                phone: input.phone,
                email: input.email,
                gender: input.gender,
                dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
            },
        });
    }

    static async listPatients(clinicId: string) {
        return await prisma.patient.findMany({
            where: { clinicId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    static async searchPatients(clinicId: string, query: string) {
        return await prisma.patient.findMany({
            where: {
                clinicId,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query } },
                ],
            },
            orderBy: { name: 'asc' },
        });
    }

    static async getPatientById(id: string) {
        const patient = await prisma.patient.findUnique({
            where: { id },
        });
        if (!patient) throw { status: 404, message: 'Patient not found' };
        return patient;
    }

    static async updatePatient(id: string, input: UpdatePatientInput) {
        const data: any = { ...input };
        if (input.dateOfBirth) {
            data.dateOfBirth = new Date(input.dateOfBirth);
        }

        return await prisma.patient.update({
            where: { id },
            data,
        });
    }

    static async toggleStatus(id: string, isActive: boolean) {
        return await prisma.patient.update({
            where: { id },
            data: { isActive },
        });
    }
}
