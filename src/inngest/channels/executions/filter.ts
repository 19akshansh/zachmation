import { CHANNELS } from "@/config/channels";
import { realtime } from "inngest";
import { z } from "zod";

export const filterChannel = realtime.channel({
  name: CHANNELS.FILTER,
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
        error: z.string().optional(),
        keptCount: z.number().optional(),
      }),
    },
  },
});
