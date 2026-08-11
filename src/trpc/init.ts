import { isProNode } from "@/config/nodeTypes";
import { NodeType } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { getSubscriptionStatus } from "@/lib/subscriptions";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    session,
  };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
  });
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = ctx.session;

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You can't access this.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: session,
    },
  });
});
export const proProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const subscriptionStatus = await getSubscriptionStatus(ctx.auth.user.id);

  if (subscriptionStatus === "UNKNOWN") {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message:
        "Unable to verify subscription status. Please try again shortly.",
    });
  }

  const hasPro = subscriptionStatus === "PRO";

  return next({
    ctx: {
      ...ctx,
      limits: hasPro
        ? {
            workflows: Infinity,
            credentials: Infinity,
          }
        : {
            workflows: 1,
            credentials: 2,
          },
      hasPro,
    },
  });
});
export const proNodesProcedure = proProcedure.use(
  async ({ ctx, next, getRawInput }) => {
    const input = (await getRawInput()) as {
      nodes?: {
        type: NodeType;
      }[];
    };

    const containsProNodes =
      input.nodes?.some((node) => isProNode(node.type)) ?? false;

    if (containsProNodes && !ctx.hasPro) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This workflow contains PRO nodes.",
      });
    }

    return next();
  },
);
