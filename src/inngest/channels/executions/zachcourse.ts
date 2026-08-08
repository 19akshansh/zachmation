import { CHANNELS } from "@/config/channels";
import { realtime } from "inngest";
import { z } from "zod";

export const zachcourseChannel = realtime.channel({
  name: CHANNELS.ZACHCOURSE,
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
