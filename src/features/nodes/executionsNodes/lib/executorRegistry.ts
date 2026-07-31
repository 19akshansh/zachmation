import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../types";
import { manualReqTriggerExecutor } from "@/features/nodes/triggersNodes/components/manualTrigger/executor";
import { HTTPReqTriggerExecutor } from "../components/httpReq/executor";
import { googleFormTriggerExecutor } from "@/features/nodes/triggersNodes/components/googleFormsTrigger/executor";
import { stripeTriggerExecutor } from "@/features/nodes/triggersNodes/components/stripeTrigger/executor";
import { webhookTriggerExecutor } from "@/features/nodes/triggersNodes/components/webhookTrigger/executor";
import { GeminiExecutor } from "../components/gemini/executor";
import { openAIExecutor } from "../components/openai/executor";
import { anthropicExecutor } from "../components/anthropic/executor";
import { DiscordExecutor } from "../components/discord/executor";
import { SlackExecutor } from "../components/slack/executor";
import { BlackForestExecutor } from "../components/blackforest/executor";

export const executorRegistry: Record<NodeType, NodeExecutor<any>> = {
  [NodeType.MANUAL_TRIGGER]: manualReqTriggerExecutor,
  [NodeType.INITIAL]: manualReqTriggerExecutor,
  [NodeType.HTTP_REQ]: HTTPReqTriggerExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.WEBHOOK_TRIGGER]: webhookTriggerExecutor,
  [NodeType.GEMINI]: GeminiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.OPENAI]: openAIExecutor,
  [NodeType.DISCORD]: DiscordExecutor,
  [NodeType.SLACK]: SlackExecutor,
  [NodeType.BLACK_LABS]: BlackForestExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor<any> => {
  const executor = executorRegistry[type];

  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }

  return executor;
};
