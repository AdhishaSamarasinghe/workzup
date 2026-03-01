// GET /api/conversations/[id]/messages - Get messages for a conversation
// POST /api/conversations/[id]/messages - Send a new message

import { NextRequest, NextResponse } from "next/server";
import {
  getConversation,
  getMessages,
  createMessage,
  markAllMessagesAsRead,
  CURRENT_USER_ID,
} from "@/lib/db";
import { ApiResponse, Message, SendMessageRequest } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse<Message[]>>> {
  try {
    const { id } = await context.params;
    const conversation = getConversation(id);

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Check if user is a participant
    if (!conversation.participants.some((p) => p.id === CURRENT_USER_ID)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const messages = getMessages(id);

    // Mark messages as read when fetched
    markAllMessagesAsRead(id);

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse<Message>>> {
  try {
    const { id } = await context.params;
    const body: SendMessageRequest = await request.json();
    const { content, replyToId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content is required" },
        { status: 400 },
      );
    }

    const conversation = getConversation(id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Check if user is a participant
    if (!conversation.participants.some((p) => p.id === CURRENT_USER_ID)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const message = createMessage(
      id,
      CURRENT_USER_ID,
      content.trim(),
      replyToId,
    );

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Failed to create message" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: message,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 },
    );
  }
}
