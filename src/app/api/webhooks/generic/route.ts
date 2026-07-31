import { sendWorkflowExecution } from "@/inngest/utils";
import prisma from "@/lib/db";
import { checkRateLimit } from "@/helpers/rateLimit";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: "Missing workflowId" },
        { status: 400 },
      );
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: { id: true },
    });

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: "Workflow not found" },
        { status: 404 },
      );
    }

    const { allowed, retryAfterMs } = checkRateLimit(
      `generic-webhook:${workflowId}`,
      { limit: 30, windowMs: 60_000 },
    );

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limited" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        },
      );
    }

    const body = await request.json();
    await sendWorkflowExecution({
      workflowId,
      initialData: { webhook: body },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Webhook failed" },
      { status: 500 },
    );
  }
}
