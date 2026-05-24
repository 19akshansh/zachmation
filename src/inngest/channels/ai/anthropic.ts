import { realtime } from "inngest";
import { z } from "zod";

export const anthropicChannel = realtime.channel({
  name: "anthropicExec",
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
