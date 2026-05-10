import { InitialNode } from "@/components/initialNode";
import { HTTPReqNode } from "@/features/executions/components/httpReq/node";
import { ManualTriggerNode } from "@/features/triggers/components/manualTrigger/node";
import { NodeType } from "@/generated/prisma/enums";
import type { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQ]: HTTPReqNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
