import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { sendWorkflowExecution } from "@/inngest/utils";
import { PAGINATION } from "@/config/constants";
import { ExecutionStatus } from "@/generated/prisma/enums";

export const executionsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return prisma.execution.findUniqueOrThrow({
        where: {
          id: input.id,
          workflow: {
            userId: ctx.auth.user.id,
          },
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }),


  retry: protectedProcedure
    .input(z.object({ executionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const execution = await prisma.execution.findUnique({
        where: {
          id: input.executionId,
        },
        select: {
          id: true,
          status: true,
          workflowId: true,
          initialData: true,
          workflow: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!execution || execution.workflow.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (execution.status !== ExecutionStatus.FAILED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only failed executions can be retried.",
        });
      }

      const result = await sendWorkflowExecution({
        workflowId: execution.workflowId,
        initialData: (execution.initialData ?? {}) as Record<string, unknown>,
      });

      if ("skipped" in result && result.skipped) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "This workflow is inactive.",
        });
      }

      return { retried: true };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;

      const [items, totalCount] = await Promise.all([
        prisma.execution.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            workflow: {
              userId: ctx.auth.user.id,
            },
          },
          orderBy: {
            startedAt: "desc",
          },
          include: {
            workflow: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        }),
        prisma.execution.count({
          where: {
            workflow: {
              userId: ctx.auth.user.id,
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      };
    }),
});
