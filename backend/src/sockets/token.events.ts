import { Server } from 'socket.io';
import { QueueSocketEvents } from './socket.types';

let io: Server;

export const initTokenEvents = (socketIO: Server) => {
    io = socketIO;
};

export const emitTokenCreated = (clinicId: string, doctorId: string, tokenNumber: number) => {
    if (!io) return;
    const room = `${clinicId}-${doctorId}`;
    io.to(room).emit(QueueSocketEvents.TOKEN_CREATED, {
        tokenNumber,
        doctorId,
    });
};

export const emitTokenNext = (clinicId: string, doctorId: string, tokenNumber: number) => {
    if (!io) return;
    const room = `${clinicId}-${doctorId}`;
    io.to(room).emit(QueueSocketEvents.TOKEN_NEXT, {
        currentToken: tokenNumber,
    });
};

export const emitTokenSkipped = (clinicId: string, doctorId: string, tokenNumber: number) => {
    if (!io) return;
    const room = `${clinicId}-${doctorId}`;
    io.to(room).emit(QueueSocketEvents.TOKEN_SKIPPED, {
        tokenNumber,
    });
};

export const emitTokenCancelled = (clinicId: string, doctorId: string, tokenNumber: number) => {
    if (!io) return;
    const room = `${clinicId}-${doctorId}`;
    io.to(room).emit(QueueSocketEvents.TOKEN_CANCELLED, {
        tokenNumber,
    });
};
