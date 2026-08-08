import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { inngest } from "@/inngest/client";
import { getClientSubscriptionToken } from "inngest/react";
import { CHANNELS } from "@/config/channels";

type Channel = (typeof CHANNELS)[keyof typeof CHANNELS];

const ALLOWED_CHANNELS = Object.values(CHANNELS) as Channel[];

const isAllowedChannel = (value: string): value is Channel => {
  return ALLOWED_CHANNELS.includes(value as Channel);
};

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");

  if (!channel) {
    return new Response("Missing channel", { status: 400 });
  }

  if (!isAllowedChannel(channel)) {
    return new Response("Invalid channel", { status: 400 });
  }

  const token = await getClientSubscriptionToken(inngest, {
    channel,
    topics: ["status"],
  });

  return Response.json(token, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
