import { CHANNELS } from "@/config/channels";
import { realtime } from "inngest";
import { z } from "zod";

export const zachurlChannel = realtime.channel({
  name: CHANNELS.ZACHURL,
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
        error: z.string().optional(),
      }),
    },
  },
});
