import { realtime } from "inngest";
import { z } from "zod";

export const geminiChannel = realtime.channel({
  name: "geminiExec",
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
