import { InitialNode } from "@/components/initialNode";
import { AnthropicNode } from "@/features/nodes/executionsNodes/components/anthropic/node";
import { BlackForestNode } from "@/features/nodes/executionsNodes/components/blackforest/node";
import { DiscordNode } from "@/features/nodes/executionsNodes/components/discord/node";
import { GeminiNode } from "@/features/nodes/executionsNodes/components/gemini/node";
import { HTTPReqNode } from "@/features/nodes/executionsNodes/components/httpReq/node";
import { OpenAINode } from "@/features/nodes/executionsNodes/components/openai/node";
import { SlackNode } from "@/features/nodes/executionsNodes/components/slack/node";
import { GoogleFormTriggerNode } from "@/features/nodes/triggersNodes/components/googleFormsTrigger/node";
import { ManualTriggerNode } from "@/features/nodes/triggersNodes/components/manualTrigger/node";
import { StripeTriggerNode } from "@/features/nodes/triggersNodes/components/stripeTrigger/node";
import { WebhookTriggerNode } from "@/features/nodes/triggersNodes/components/webhookTrigger/node";
import { NodeType } from "@/generated/prisma/enums";
import type { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQ]: HTTPReqNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.WEBHOOK_TRIGGER]: WebhookTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenAINode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.DISCORD]: DiscordNode,
  [NodeType.SLACK]: SlackNode,
  [NodeType.BLACK_LABS]: BlackForestNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
