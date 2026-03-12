import { TokenType, TokenStatus } from '@prisma/client';

export interface GenerateTokenInput {
    clinicId: string;
    doctorId: string;
    patientId: string;
    tokenType: TokenType;
}

export interface TokenResponse {
    id: string;
    tokenNumber: number;
    tokenType: TokenType;
    status: TokenStatus;
    estimatedWaitMinutes: number;
    queueDate: Date;
}

export interface QueueItem {
    id: string;
    tokenNumber: number;
    patientName: string;
    tokenType: TokenType;
    status: TokenStatus;
    createdAt: Date;
}
