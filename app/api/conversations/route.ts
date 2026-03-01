// GET /api/conversations - Get all conversations for current user
// POST /api/conversations - Create a new conversation

import { NextRequest, NextResponse } from "next/server";
import {
  getAllConversations,
  createConversation,
  getUser,
  CURRENT_USER_ID,
} from "@/lib/db";
import {
  ApiResponse,
  Conversation,
  CreateConversationRequest,
} from "@/lib/types";

export async function GET(): Promise<
  NextResponse<ApiResponse<Conversation[]>>
> {
  try {
    const conversations = getAllConversations(CURRENT_USER_ID);

    // Transform conversations to include participant info
    const transformedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p.id !== CURRENT_USER_ID,
      );
      return {
        ...conv,
        participant: otherParticipant,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedConversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<Conversation>>> {
  try {
    const body: CreateConversationRequest = await request.json();
    const { participantIds, type, jobId, initialMessage } = body;

    // Validate participants
    const participants = [getUser(CURRENT_USER_ID)!];
    for (const id of participantIds) {
      const user = getUser(id);
      if (!user) {
        return NextResponse.json(
          { success: false, error: `User ${id} not found` },
          { status: 400 },
        );
      }
      participants.push(user);
    }

    const conversation = createConversation({
      type,
      participants,
      jobId,
      unreadCount: 0,
      isArchived: false,
      isPinned: false,
    });

    return NextResponse.json({
      success: true,
      data: conversation,
      message: "Conversation created successfully",
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create conversation" },
      { status: 500 },
    );
  }
}
