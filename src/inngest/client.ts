import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "zachmation",
  ...(process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_INNGEST_DEV_SERVER_URL!
    ? {
        baseUrl: process.env.NEXT_PUBLIC_INNGEST_DEV_SERVER_URL!,
      }
    : {}),
});
