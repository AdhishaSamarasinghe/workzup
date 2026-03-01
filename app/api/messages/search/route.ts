// GET /api/messages/search - Search messages across conversations

import { NextRequest, NextResponse } from "next/server";
import { searchMessages } from "@/lib/db";
import { ApiResponse, Message } from "@/lib/types";

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<Message[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const conversationId = searchParams.get("conversationId");

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, error: "Search query must be at least 2 characters" },
        { status: 400 },
      );
    }

    const results = searchMessages(query, conversationId || undefined);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error searching messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search messages" },
      { status: 500 },
    );
  }
}
