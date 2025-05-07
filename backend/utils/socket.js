import { Server } from 'socket.io';

const connectedTechs = new Map();  // Map<techId, socketId>
const connectedAdmins = new Set(); // Set<socketId>

let io;

export const setupSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST', 'PUT'],
        },
    });

    io.on('connection', (socket) => {

        // Identify user position and ID
        socket.on('register', ({ position, userId }) => {
            if (position === 'admin' || position === 'superadmin') {
                connectedAdmins.add(socket.id);
                console.log(`Admin connected: ${socket.id}`);
            } else if (position === 'tech') {
                connectedTechs.set(userId, socket.id);
                console.log(`Tech ${userId} connected: ${socket.id}`);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            connectedAdmins.delete(socket.id);
            for (const [techId, sockId] of connectedTechs.entries()) {
                if (sockId === socket.id) {
                    connectedTechs.delete(techId);
                    break;
                }
            }
        });
    });
};

export const emitToAdmins = (event, data) => {
    if (!io) return;
    connectedAdmins.forEach((socketId) => {
        io.to(socketId).emit(event, data);
    });
};

export const emitToTech = (techId, event, data) => {
    if (!io) return;
    const socketId = connectedTechs.get(techId);
    if (socketId) {
        io.to(socketId).emit(event, data);
    }
};