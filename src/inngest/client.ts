import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "zachmation",
  baseUrl: process.env.NEXT_PUBLIC_INNGEST_DEV_SERVER_URL,
});
