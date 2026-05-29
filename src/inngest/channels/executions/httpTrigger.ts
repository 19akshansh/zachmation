import { realtime } from "inngest";
import { z } from "zod";

export const httpTriggerChannel = realtime.channel({
  name: "httpTriggerExec",
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
      }),
    },
  },
});
