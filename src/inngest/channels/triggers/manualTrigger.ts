import { CHANNELS } from "@/config/channels";
import { realtime } from "inngest";
import { z } from "zod";

export const manualTriggerChannel = realtime.channel({
  name: CHANNELS.MANUAL_TRIGGER,
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success"]),
      }),
    },
  },
});
