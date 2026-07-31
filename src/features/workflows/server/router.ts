import { generateSlug } from "random-word-slugs";
import type { Edge, Node } from "@xyflow/react";
import prisma from "@/lib/db";
import {
  createTRPCRouter,
  proNodesProcedure,
  proProcedure,
  protectedProcedure,
} from "@/trpc/init";
import z from "zod";
import { PAGINATION } from "@/config/constants";
import { NodeType } from "@/generated/prisma/enums";
import { sendWorkflowExecution } from "@/inngest/utils";
import { TRPCError } from "@trpc/server";
import { PRO_NODES } from "@/config/proNodes";
import { decrypt } from "@/lib/encryption";
import { envSchem } from "@/config/envSchema";

export const workflowsRouter = createTRPCRouter({
  registerTelegramWebhook: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        nodeId: z.string(),
        credentialId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const node = await prisma.node.findFirst({
        where: {
          id: input.nodeId,
          workflowId: input.workflowId,
          type: NodeType.TELEGRAM_TRIGGER,
          workflow: { userId: ctx.auth.user.id },
        },
      });

      if (!node) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Telegram trigger node not found.",
        });
      }

      const credential = await prisma.credential.findFirst({
        where: {
          id: input.credentialId,
          userId: ctx.auth.user.id,
          type: "TELEGRAM_BOT",
        },
      });

      if (!credential) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Telegram bot credential not found.",
        });
      }

      const botToken = decrypt(credential.value);
      const secretToken = crypto.randomUUID().replace(/-/g, "");
      const webhookUrl = `${envSchem.NEXT_PUBLIC_APP_URL}/api/webhooks/telegram?workflowId=${input.workflowId}&nodeId=${input.nodeId}`;

      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/setWebhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: webhookUrl,
            secret_token: secretToken,
          }),
        },
      );

      const result = (await response.json()) as {
        ok?: boolean;
        description?: string;
      };

      if (!response.ok || !result.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.description ?? "Telegram setWebhook failed.",
        });
      }

      await prisma.node.update({
        where: { id: node.id },
        data: {
          data: {
            ...((node.data as Record<string, unknown>) ?? {}),
            credentialId: input.credentialId,
            telegramSecretToken: secretToken,
          },
        },
      });

      return { webhookUrl };
    }),
  execute: proProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        include: {
          nodes: true,
        },
      });

      const containsProNodes = workflow.nodes.some((node) =>
        PRO_NODES.has(node.type),
      );

      if (containsProNodes && !ctx.hasPro) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This workflow contains PRO nodes.",
        });
      }

      await sendWorkflowExecution({
        workflowId: input.id,
      });

      return workflow;
    }),
  create: proProcedure.mutation(async ({ ctx }) => {
    const workflowCount = await prisma.workflow.count({
      where: {
        userId: ctx.auth.user.id,
      },
    });

    if (workflowCount >= ctx.limits.workflows) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Workflow limit reached. UPGRADE TO PRO.",
      });
    }

    return prisma.workflow.create({
      data: {
        name: generateSlug(3),
        userId: ctx.auth.user.id,
        nodes: {
          create: {
            type: NodeType.INITIAL,
            position: { x: 0, y: 0 },
            name: NodeType.INITIAL,
          },
        },
      },
    });
  }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.update({
        where: { id: input.id, userId: ctx.auth.user.id },
        data: { name: input.name },
      });
    }),
  update: proNodesProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.enum(NodeType),
            position: z.object({
              x: z.number(),
              y: z.number(),
            }),
            data: z.record(z.string(), z.any()).optional(),
          }),
        ),
        edges: z.array(
          z.object({
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullish(),
            targetHandle: z.string().nullish(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, nodes, edges } = input;
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });

      return await prisma.$transaction(async (tx) => {
        await tx.node.deleteMany({
          where: { workflowId: id },
        });

        await tx.node.createMany({
          data: nodes.map((node) => ({
            id: node.id,
            workflowId: id,
            name: node.type,
            type: node.type,
            position: node.position,
            data: node.data || {},
          })),
        });

        await tx.connection.createMany({
          data: edges.map((edge) => ({
            workflowId: id,
            fromNodeId: edge.source,
            toNodeId: edge.target,
            fromOutput: edge.sourceHandle || "main",
            toInput: edge.targetHandle || "main",
          })),
        });

        await tx.workflow.update({
          where: { id },
          data: { updatedAt: new Date() },
        });

        return workflow;
      });
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      const nodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position as { x: number; y: number },
        data: (node.data as Record<string, unknown>) || {},
      }));

      const edges: Edge[] = workflow.connections.map((connection) => ({
        id: connection.id,
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: connection.fromOutput,
        targetHandle: connection.toInput,
      }));

      return {
        id: workflow.id,
        name: workflow.name,
        edges,
        nodes,
      };
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
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const [items, totalCount] = await Promise.all([
        prisma.workflow.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.workflow.count({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
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
