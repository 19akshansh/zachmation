import { headers } from "next/headers";
import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { auth } from "@/lib/auth";

const ALLOWED_CHANNELS = ["httpTriggerExec", "manualTriggerExec"] as const;

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");

  if (
    !channel ||
    !ALLOWED_CHANNELS.includes(
      channel as "httpTriggerExec" | "manualTriggerExec",
    )
  ) {
    return new Response("Invalid channel", {
      status: 400,
    });
  }

  const token = await getClientSubscriptionToken(inngest, {
    channel,
    topics: ["status"],
  });

  return new Response(JSON.stringify(token), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Pragma: "no-cache",
    },
  });
}
