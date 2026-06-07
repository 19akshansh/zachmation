import { CHANNELS } from "@/config/channels";
import { realtime } from "inngest";
import { z } from "zod";

export const discordChannel = realtime.channel({
  name: CHANNELS.DISCORD,
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
