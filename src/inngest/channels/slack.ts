import { realtime } from "inngest";
import { z } from "zod";

export const slackChannel = realtime.channel({
  name: "slackExec",
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
