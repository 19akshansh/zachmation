import { InitialNode } from "@/components/initialNode";
import { AnthropicNode } from "@/features/executions/components/anthropic/node";
import { DiscordNode } from "@/features/executions/components/discord/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { HTTPReqNode } from "@/features/executions/components/httpReq/node";
import { OpenAINode } from "@/features/executions/components/openai/node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/googleFormsTrigger/node";
import { ManualTriggerNode } from "@/features/triggers/components/manualTrigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripeTrigger/node";
import { NodeType } from "@/generated/prisma/enums";
import type { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQ]: HTTPReqNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenAINode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.DISCORD]: DiscordNode,
  // [NodeType.SLACK]: SlackNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
