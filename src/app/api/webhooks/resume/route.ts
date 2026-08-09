import { inngest } from "@/inngest/client";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const nodeId = url.searchParams.get("nodeId");

  if (!nodeId) {
    return NextResponse.json(
      { success: false, error: "Missing nodeId" },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => ({}));

  await inngest.send({
    name: "workflow/wait.resumed",
    data: { nodeId, payload: body },
  });

  return NextResponse.json({ success: true });
}
