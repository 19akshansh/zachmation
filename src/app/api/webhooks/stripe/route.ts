import { sendWorkflowExecution } from "@/inngest/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);

    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing workflowId",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    await sendWorkflowExecution({
      workflowId,
      initialData: {
        stripe: body,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Stripe webhook failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Webhook failed",
      },
      {
        status: 500,
      },
    );
  }
}
