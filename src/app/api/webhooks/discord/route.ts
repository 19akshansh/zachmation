import { checkRateLimit } from "@/helpers/rateLimit";
import { sendWorkflowExecution } from "@/inngest/utils";
import prisma from "@/lib/db";
import { createPublicKey, verify } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

const PING = 1;
const PONG = 1;
const DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5;
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

function verifyDiscordRequest(
  rawBody: string,
  signature: string,
  timestamp: string,
  publicKeyHex: string,
) {
  try {
    const publicKeyBytes = Buffer.from(publicKeyHex, "hex");
    const signatureBytes = Buffer.from(signature, "hex");
    if (publicKeyBytes.length !== 32 || signatureBytes.length !== 64)
      return false;

    const publicKey = createPublicKey({
      key: Buffer.concat([ED25519_SPKI_PREFIX, publicKeyBytes]),
      format: "der",
      type: "spki",
    });

    return verify(
      null,
      Buffer.from(timestamp + rawBody),
      publicKey,
      signatureBytes,
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const workflowId = new URL(request.url).searchParams.get("workflowId");
  if (!workflowId) {
    return NextResponse.json({ error: "Missing workflowId" }, { status: 400 });
  }

  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  if (!signature || !timestamp) {
    return NextResponse.json(
      { error: "Missing Discord signature" },
      { status: 401 },
    );
  }

  const trigger = await prisma.node.findFirst({
    where: { workflowId, type: "DISCORD_TRIGGER" },
    select: { data: true },
  });
  const data = trigger?.data as { publicKey?: string } | null | undefined;
  if (!trigger || !data?.publicKey) {
    return NextResponse.json(
      { error: "Discord trigger not configured" },
      { status: 404 },
    );
  }

  const rawBody = await request.text();
  if (!verifyDiscordRequest(rawBody, signature, timestamp, data.publicKey)) {
    return NextResponse.json(
      { error: "Invalid request signature" },
      { status: 401 },
    );
  }

  let interaction: Record<string, unknown> & { type?: number };
  try {
    interaction = JSON.parse(rawBody) as Record<string, unknown> & {
      type?: number;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (interaction.type === PING) {
    return NextResponse.json({ type: PONG });
  }

  const { allowed } = checkRateLimit(`discord-webhook:${workflowId}`, {
    limit: 60,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  await sendWorkflowExecution({
    workflowId,
    initialData: { discord: interaction },
  });

  // Discord requires an interaction acknowledgement within three seconds.
  return NextResponse.json({ type: DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE });
}
