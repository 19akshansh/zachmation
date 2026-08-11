import { NodeType } from "@/generated/prisma/enums";
import { sendWorkflowExecution } from "@/inngest/utils";
import { checkRateLimit } from "@/helpers/rateLimit";
import prisma from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");
    const nodeId = url.searchParams.get("nodeId");

    if (!workflowId || !nodeId) {
      return NextResponse.json(
        { success: false, error: "Missing workflowId/nodeId" },
        { status: 400 },
      );
    }

    const node = await prisma.node.findFirst({
      where: {
        id: nodeId,
        workflowId,
        type: NodeType.TELEGRAM_TRIGGER,
      },
      select: { data: true },
    });

    const nodeData = node?.data as
      { telegramSecretToken?: string } | null | undefined;
    const expectedSecret = nodeData?.telegramSecretToken;
    const receivedSecret = request.headers.get(
      "x-telegram-bot-api-secret-token",
    );

    if (!expectedSecret || receivedSecret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: "Invalid secret token" },
        { status: 401 },
      );
    }

    const { allowed } = checkRateLimit(`telegram-webhook:${workflowId}`, {
      limit: 60,
      windowMs: 60_000,
    });

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limited" },
        { status: 429 },
      );
    }

    const body = await request.json();

    await sendWorkflowExecution({
      workflowId,
      initialData: { telegram: body },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Webhook failed" },
      { status: 500 },
    );
  }
}
