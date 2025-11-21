import { inngest } from '@/inngest/client';
import { baseProcedure, createTRPCRouter, premiumProcedure, protectedProcedure } from '../init';
import prisma from '@/lib/db';
export const appRouter = createTRPCRouter({
  testAi: premiumProcedure
    .mutation(async ({ ctx }) => {
      await inngest.send({
        name: "exec/ai",
      })

      return { success: true, message: "Job queued."};
    }),
  getWorkflows: protectedProcedure
    .query(() => {
       return prisma.workflow.findMany();
    }),
  createWorkflow: protectedProcedure
    .mutation(async ({ ctx }) => {
      await inngest.send({
        name: "test/hello.world",
        data: {
          email: ctx.auth.user.email, 
        },
      });

      return prisma.workflow.create({
        data: {
          name: "test-workflow",
        },
      });

      return { success: true, message: "Job queued" };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;