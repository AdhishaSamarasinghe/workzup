// GET /api/conversations/[id]/messages/[messageId] - Get a specific message
// PATCH /api/conversations/[id]/messages/[messageId] - Edit a message
// DELETE /api/conversations/[id]/messages/[messageId] - Delete a message

import { NextRequest, NextResponse } from "next/server";
import {
  getConversation,
  getMessage,
  updateMessage,
  deleteMessage,
  markMessageAsRead,
  CURRENT_USER_ID,
} from "@/lib/db";
import { ApiResponse, Message, UpdateMessageRequest } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string; messageId: string }> };

export async function GET(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse<Message>>> {
  try {
    const { id, messageId } = await context.params;
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

    const message = getMessage(id, messageId);
    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch message" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse<Message>>> {
  try {
    const { id, messageId } = await context.params;
    const body: UpdateMessageRequest & { action?: string } =
      await request.json();

    const conversation = getConversation(id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 },
      );
    }

    const message = getMessage(id, messageId);
    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 },
      );
    }

    // Handle mark as read action
    if (body.action === "markRead") {
      markMessageAsRead(id, messageId);
      const updatedMessage = getMessage(id, messageId);
      return NextResponse.json({
        success: true,
        data: updatedMessage!,
        message: "Message marked as read",
      });
    }

    // Only the sender can edit their message
    if (message.senderId !== CURRENT_USER_ID) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own messages" },
        { status: 403 },
      );
    }

    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content is required" },
        { status: 400 },
      );
    }

    const updatedMessage = updateMessage(id, messageId, body.content.trim());
    if (!updatedMessage) {
      return NextResponse.json(
        { success: false, error: "Failed to update message" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedMessage,
      message: "Message updated successfully",
    });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update message" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id, messageId } = await context.params;

    const conversation = getConversation(id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 },
      );
    }

    const message = getMessage(id, messageId);
    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 },
      );
    }

    // Only the sender can delete their message
    if (message.senderId !== CURRENT_USER_ID) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own messages" },
        { status: 403 },
      );
    }

    const deleted = deleteMessage(id, messageId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete message" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete message" },
      { status: 500 },
    );
  }
}
