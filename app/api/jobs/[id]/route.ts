// GET /api/jobs/[id] - Get job details
// PATCH /api/jobs/[id] - Update job details

import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob, CURRENT_USER_ID } from "@/lib/db";
import { ApiResponse, JobDetails, UpdateJobDetailsRequest } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse<JobDetails>>> {
  try {
    const { id } = await context.params;
    const job = getJob(id);

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse<JobDetails>>> {
  try {
    const { id } = await context.params;
    const body: UpdateJobDetailsRequest = await request.json();

    const job = getJob(id);
    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 },
      );
    }

    // Check if user is the job creator (job poster can edit)
    // For now, we allow any participant in the conversation to see updates
    // In production, add proper authorization

    const updatedJob = updateJob(id, body);
    if (!updatedJob) {
      return NextResponse.json(
        { success: false, error: "Failed to update job" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: "Job updated successfully",
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update job" },
      { status: 500 },
    );
  }
}
