import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { polarClient } from "@/lib/polar";
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
  let hasPro = false;

  try {
    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.auth.user.id,
    });

    hasPro =
      customer.activeSubscriptions?.some(
        (sub) =>
          sub.status === "active" &&
          sub.productId === process.env.POLAR_PRO_PRODUCT_SLUG,
      ) ?? false;
  } catch (error) {
    console.log("error");
  }

  const plan = hasPro ? "PRO" : "FREE";

  return next({
    ctx: {
      ...ctx,
      plan,
      limits: hasPro
        ? {
            workflows: Infinity,
            credentials: Infinity,
          }
        : {
            workflows: 1,
            credentials: 2,
          },
    },
  });
});
