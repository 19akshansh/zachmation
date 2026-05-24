import { realtime } from "inngest";

import { z } from "zod";

export const openaiChannel = realtime.channel({
  name: "openaiExec",
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
