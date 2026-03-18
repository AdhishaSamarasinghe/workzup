const { Server } = require("socket.io");
const prisma = require('./prismaClient');

let io;
const onlineUsers = new Map(); // socket.id -> userId

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

        socket.on("setup_user", (userId) => {
            onlineUsers.set(socket.id, userId);
            // Emit to the connecting socket its own online users list
            socket.emit("online_users", Array.from(new Set(onlineUsers.values())));
            // Broadcast to everyone else that this user is connected
            socket.broadcast.emit("user_connected", userId);
        });

        socket.on("join_room", (conversationId) => {
            socket.join(conversationId);
            console.log(`WebSocket: Socket ${socket.id} joined room ${conversationId}`);
        });

        socket.on("leave_room", (conversationId) => {
            socket.leave(conversationId);
            console.log(`WebSocket: Socket ${socket.id} left room ${conversationId}`);
        });

        socket.on("send_message", async (data) => {
            try {
                const { senderId, conversationId, content, text, receiverId, replyToId } = data;
                const msgContent = (content || text || "").trim();

                if (!senderId || !conversationId || !msgContent) return;

                const timestampIso = new Date().toISOString();
                const targetConvId = conversationId;

                let conv = await prisma.conversation.findUnique({ where: { id: targetConvId } });
                if (!conv) return;

                const participants = Array.isArray(conv.participantIds) ? conv.participantIds : [];
                const uniqueParticipants = [...new Set(participants.filter(Boolean))];

                if (!uniqueParticipants.includes(senderId) || uniqueParticipants.length < 2) {
                    return;
                }

                const resolvedReceiverId = receiverId || uniqueParticipants.find((id) => id !== senderId) || null;
                if (!resolvedReceiverId || resolvedReceiverId === senderId) {
                    return;
                }

                await prisma.conversation.update({
                    where: { id: targetConvId },
                    data: {
                        lastMessage: msgContent,
                        lastMessageTime: timestampIso,
                        unreadCount: { increment: 1 }
                    }
                });

                const newMessage = await prisma.message.create({
                    data: {
                        conversationId: targetConvId,
                        senderId,
                        receiverId: resolvedReceiverId,
                        content: msgContent,
                        replyToId,
                        timestamp: timestampIso
                    }
                });

                // Broadcast the message to all clients in the room including sender
                io.to(targetConvId).emit("receive_message", { ...newMessage, text: newMessage.content });
            } catch (error) {
                console.error("WebSocket: Error sending message", error);
            }
        });

        socket.on("typing", (data) => {
            const { conversationId, senderId } = data;
            socket.to(conversationId).emit("typing", { senderId });
        });

        socket.on("stop_typing", (data) => {
            const { conversationId, senderId } = data;
            socket.to(conversationId).emit("stop_typing", { senderId });
        });

        socket.on("disconnect", () => {
            console.log("WebSocket: Client disconnected:", socket.id);
            const userId = onlineUsers.get(socket.id);
            if (userId) {
                onlineUsers.delete(socket.id);
                // Emit offline if user has no other active connections
                if (!Array.from(onlineUsers.values()).includes(userId)) {
                    io.emit("user_disconnected", userId);
                }
            }
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
