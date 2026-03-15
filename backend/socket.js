const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("WebSocket: New client connected:", socket.id);

        socket.on("join_room", (conversationId) => {
            socket.join(conversationId);
            console.log(`WebSocket: Socket ${socket.id} joined room ${conversationId}`);
        });

        socket.on("leave_room", (conversationId) => {
            socket.leave(conversationId);
            console.log(`WebSocket: Socket ${socket.id} left room ${conversationId}`);
        });

        socket.on("disconnect", () => {
            console.log("WebSocket: Client disconnected:", socket.id);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIo };
