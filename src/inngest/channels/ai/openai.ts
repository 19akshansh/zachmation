import { CHANNELS } from "@/config/channels";
import { realtime } from "inngest";

import { z } from "zod";

export const openaiChannel = realtime.channel({
  name: CHANNELS.OPENAI,
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
