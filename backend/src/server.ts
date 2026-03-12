import http from 'http';
import app from './app';
import { env } from './config/env';
import { setupSocket } from './sockets/socket.server';
import logger from './utils/logger';

const server = http.createServer(app);

// Initialize Socket.IO
const io = setupSocket(server);

// Start server
const PORT = env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
    logger.error('Unhandled Rejection! 💥 Shutting down...', err.message);
    server.close(() => {
        process.exit(1);
    });
});
