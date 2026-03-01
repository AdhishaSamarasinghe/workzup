// POST /api/conversations/[id]/typing - Update typing status

import { NextRequest, NextResponse } from "next/server";
import {
  getConversation,
  setTypingStatus,
  getTypingUsers,
  CURRENT_USER_ID,
} from "@/lib/db";
import { ApiResponse, User } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse<User[]>>> {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { isTyping } = body;

    const conversation = getConversation(id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Update typing status
    setTypingStatus(id, CURRENT_USER_ID, isTyping);

    // Return list of users currently typing
    const typingUsers = getTypingUsers(id);

    return NextResponse.json({
      success: true,
      data: typingUsers,
    });
  } catch (error) {
    console.error("Error updating typing status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update typing status" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse<User[]>>> {
  try {
    const { id } = await context.params;

    const conversation = getConversation(id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 },
      );
    }

    const typingUsers = getTypingUsers(id);

    return NextResponse.json({
      success: true,
      data: typingUsers,
    });
  } catch (error) {
    console.error("Error getting typing status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get typing status" },
      { status: 500 },
    );
  }
}
