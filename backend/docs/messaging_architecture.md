# Messaging Architecture

## Tech Stack
- MongoDB or PostgreSQL via Prisma
- Express Backend
- Socket.IO for real-time WebSocket communication
- Next.js React Frontend

## Flow
1. Fetch conversation history via REST API (`/api/messages`).
2. New messages are emitted to backend (`send_message`).
3. Backend saves the message using Prisma and broadcasts it via `receive_message` to the relevant conversation room.
4. Clients listen on `receive_message` to update real-time UI.
