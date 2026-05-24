import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../types";
import { manualReqTriggerExecutor } from "@/features/triggers/components/manualTrigger/executor";
import { HTTPReqTriggerExecutor } from "../components/httpReq/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/googleFormsTrigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripeTrigger/executor";
import { GeminiExecutor } from "../components/gemini/executor";
import { openAIExecutor } from "../components/openai/executor";
import { anthropicExecutor } from "../components/anthropic/executor";

export const executorRegistry: Record<NodeType, NodeExecutor<any>> = {
  [NodeType.MANUAL_TRIGGER]: manualReqTriggerExecutor,
  [NodeType.INITIAL]: manualReqTriggerExecutor,
  [NodeType.HTTP_REQ]: HTTPReqTriggerExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: GeminiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.OPENAI]: openAIExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor<any> => {
  const executor = executorRegistry[type];

  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }

  return executor;
};
