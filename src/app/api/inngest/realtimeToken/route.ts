import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { httpTriggerChannel } from "@/inngest/channels/httpTrigger";

export async function GET() {
  const token = await getClientSubscriptionToken(inngest, {
    channel: httpTriggerChannel.name,
    topics: ["status"],
  });

  return new Response(JSON.stringify(token), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
