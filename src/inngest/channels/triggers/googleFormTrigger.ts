import { CHANNELS } from "@/config/channels";
import { realtime } from "inngest";
import { z } from "zod";

export const googleFormTriggerChannel = realtime.channel({
  name: CHANNELS.GOOGLE_FORM_TRIGGER,
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success"]),
      }),
    },
  },
});
