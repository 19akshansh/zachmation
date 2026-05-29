import { realtime } from "inngest";
import { z } from "zod";

export const stripeTriggerChannel = realtime.channel({
  name: "stripeTriggerExec",
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success"]),
      }),
    },
  },
});
