import { createOrUpdateVote, deleteVote } from "@/lib/db/mutations/votes";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/votes
 * Create or update a vote for a message
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { chatId, messageId, isUpvoted } = body;

    // Validate required fields
    if (!chatId || !messageId || typeof isUpvoted !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: chatId, messageId, isUpvoted",
        },
        { status: 400 }
      );
    }

    const vote = await createOrUpdateVote(chatId, messageId, isUpvoted);

    return NextResponse.json({
      success: true,
      vote,
    });
  } catch (error) {
    console.error("Error in POST /api/votes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save vote",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/votes
 * Remove a vote for a message
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { chatId, messageId } = body;

    // Validate required fields
    if (!chatId || !messageId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: chatId, messageId",
        },
        { status: 400 }
      );
    }

    await deleteVote(chatId, messageId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in DELETE /api/votes:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete vote",
      },
      { status: 500 }
    );
  }
}
