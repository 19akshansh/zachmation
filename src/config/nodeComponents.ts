import { InitialNode } from "@/components/initialNode";
import { AnthropicNode } from "@/features/nodes/executionsNodes/components/anthropic/node";
import { BlackForestNode } from "@/features/nodes/executionsNodes/components/blackforest/node";
import { DiscordNode } from "@/features/nodes/executionsNodes/components/discord/node";
import { GeminiNode } from "@/features/nodes/executionsNodes/components/gemini/node";
import { HTTPReqNode } from "@/features/nodes/executionsNodes/components/httpReq/node";
import { OpenAINode } from "@/features/nodes/executionsNodes/components/openai/node";
import { SlackNode } from "@/features/nodes/executionsNodes/components/slack/node";
import { SetNode } from "@/features/nodes/executionsNodes/components/set/node";
import { GoogleFormTriggerNode } from "@/features/nodes/triggersNodes/components/googleFormsTrigger/node";
import { ManualTriggerNode } from "@/features/nodes/triggersNodes/components/manualTrigger/node";
import { StripeTriggerNode } from "@/features/nodes/triggersNodes/components/stripeTrigger/node";
import { WebhookTriggerNode } from "@/features/nodes/triggersNodes/components/webhookTrigger/node";
import { TelegramTriggerNode } from "@/features/nodes/triggersNodes/components/telegramTrigger/node";
import { TelegramSendNode } from "@/features/nodes/executionsNodes/components/telegramSend/node";
import { DiscordTriggerNode } from "@/features/nodes/triggersNodes/components/discordTrigger/node";
import { NodeType } from "@/generated/prisma/enums";
import type { NodeTypes } from "@xyflow/react";

import { ZachurlNode } from "@/features/nodes/executionsNodes/components/zachurl/node";
import { ZachCourseNode } from "@/features/nodes/executionsNodes/components/zachcourse/node";
import { LoopNode } from "@/features/nodes/executionsNodes/components/loop/node";
import { ConditionalNode } from "@/features/nodes/executionsNodes/components/conditional/node";
import { MergeNode } from "@/features/nodes/executionsNodes/components/merge/node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQ]: HTTPReqNode,
  [NodeType.SET]: SetNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.WEBHOOK_TRIGGER]: WebhookTriggerNode,
  [NodeType.TELEGRAM_TRIGGER]: TelegramTriggerNode,
  [NodeType.TELEGRAM_SEND]: TelegramSendNode,
  [NodeType.DISCORD_TRIGGER]: DiscordTriggerNode,
  [NodeType.DISCORD_SEND]: DiscordNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenAINode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.SLACK]: SlackNode,
  [NodeType.BLACK_LABS]: BlackForestNode,
  [NodeType.ZACHURL]: ZachurlNode,
  [NodeType.ZACHCOURSE]: ZachCourseNode,
  [NodeType.LOOP]: LoopNode,
  [NodeType.CONDITIONAL]: ConditionalNode,
  [NodeType.MERGE]: MergeNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
