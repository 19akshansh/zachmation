import { CHANNELS } from "@/config/channels";
import { realtime } from "inngest";
import { z } from "zod";

export const conditionalChannel = realtime.channel({
  name: CHANNELS.CONDITIONAL,
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
        output: z.string().optional(),
        error: z.string().optional(),
      }),
    },
  },
});
