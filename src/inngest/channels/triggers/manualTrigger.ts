import { realtime } from "inngest";
import { z } from "zod";

export const manualTriggerChannel = realtime.channel({
  name: "manualTriggerExec",
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success"]),
      }),
    },
  },
});
