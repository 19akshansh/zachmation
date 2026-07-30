import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const settingsRouter = createTRPCRouter({
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.user.delete({
      where: { id: ctx.auth.user.id },
    });

    return { success: true };
  }),
});
