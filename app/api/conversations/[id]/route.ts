// GET /api/conversations/[id] - Get a specific conversation
// PATCH /api/conversations/[id] - Update a conversation (archive, pin, etc.)
// DELETE /api/conversations/[id] - Delete/archive a conversation

import { NextRequest, NextResponse } from "next/server";
import {
  getConversation,
  updateConversation,
  archiveConversation,
  pinConversation,
  markAllMessagesAsRead,
  CURRENT_USER_ID,
} from "@/lib/db";
import { ApiResponse, Conversation } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse<Conversation>>> {
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

    // Get the other participant
    const otherParticipant = conversation.participants.find(
      (p) => p.id !== CURRENT_USER_ID,
    );

    return NextResponse.json({
      success: true,
      data: {
        ...conversation,
        participant: otherParticipant,
      } as Conversation & { participant: typeof otherParticipant },
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversation" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse<Conversation>>> {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { action, isPinned } = body;

    const conversation = getConversation(id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 },
      );
    }

    let updated: Conversation | undefined;

    switch (action) {
      case "archive":
        updated = archiveConversation(id);
        break;
      case "pin":
        updated = pinConversation(id, isPinned);
        break;
      case "markRead":
        markAllMessagesAsRead(id);
        updated = getConversation(id);
        break;
      default:
        updated = updateConversation(id, body);
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update conversation" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Conversation updated successfully",
    });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update conversation" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = await context.params;
    const archived = archiveConversation(id);

    if (!archived) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Conversation archived successfully",
    });
  } catch (error) {
    console.error("Error archiving conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to archive conversation" },
      { status: 500 },
    );
  }
}
