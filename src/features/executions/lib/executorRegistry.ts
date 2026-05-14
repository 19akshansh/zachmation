import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../types";
import { manualReqTriggerExecutor } from "@/features/triggers/components/manualTrigger/executor";
import { HTTPReqTriggerExecutor } from "../components/httpReq/executor";

export const executorRegistry: Record<NodeType, NodeExecutor<any>> = {
  [NodeType.MANUAL_TRIGGER]: manualReqTriggerExecutor,
  [NodeType.INITIAL]: manualReqTriggerExecutor,
  [NodeType.HTTP_REQ]: HTTPReqTriggerExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor<any> => {
  const executor = executorRegistry[type];

  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }

  return executor;
};
