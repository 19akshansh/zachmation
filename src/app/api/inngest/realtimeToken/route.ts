import { getClientSubscriptionToken } from "inngest/react";

import { inngest } from "@/inngest/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");

  if (!channel) {
    return new Response("Missing channel", {
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
    },
  });
}
