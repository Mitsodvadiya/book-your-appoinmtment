export interface JoinQueuePayload {
    clinicId: string;
    doctorId: string;
}

export interface TokenCreatedPayload {
    tokenNumber: number;
    doctorId: string;
}

export interface TokenNextPayload {
    tokenNumber: number; // The new current token
}

export interface TokenSkippedPayload {
    tokenNumber: number;
}

export interface TokenCancelledPayload {
    tokenNumber: number;
}

export enum QueueSocketEvents {
    JOIN_QUEUE = 'joinQueue',
    TOKEN_CREATED = 'tokenCreated',
    TOKEN_NEXT = 'tokenNext',
    TOKEN_SKIPPED = 'tokenSkipped',
    TOKEN_CANCELLED = 'tokenCancelled',
}
