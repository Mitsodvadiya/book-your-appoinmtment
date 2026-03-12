import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import logger from '../utils/logger';
import { initTokenEvents } from './token.events';
import { JoinQueuePayload, QueueSocketEvents } from './socket.types';

export const setupSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    // Authentication Middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            (socket as any).user = decoded;
            next();
        } catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id} (User: ${(socket as any).user?.userId})`);

        // Handle joining a specific queue room
        socket.on(QueueSocketEvents.JOIN_QUEUE, (payload: JoinQueuePayload) => {
            const room = `${payload.clinicId}-${payload.doctorId}`;
            socket.join(room);
            logger.info(`Socket ${socket.id} joined room: ${room}`);
        });

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });

    // Initialize event emitters with the io instance
    initTokenEvents(io);

    return io;
};
