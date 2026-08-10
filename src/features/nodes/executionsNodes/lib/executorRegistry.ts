import { NonRetriableError } from "inngest";
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
import { SetExecutor } from "../components/set/executor";
import { telegramTriggerExecutor } from "@/features/nodes/triggersNodes/components/telegramTrigger/executor";
import { TelegramSendExecutor } from "../components/telegramSend/executor";
import { discordTriggerExecutor } from "@/features/nodes/triggersNodes/components/discordTrigger/executor";
import { ZachurlExecutor } from "../components/zachurl/executor";
import { ZachCourseExecutor } from "../components/zachcourse/executor";
import { LoopExecutor } from "../components/loop/executor";
import { MergeExecutor } from "../components/merge/executor";
import { WaitExecutor } from "../components/wait/executor";
import { SandboxedCodeExecutor } from "../components/sandboxedCode/executor";
import { FilterExecutor } from "../components/filter/executor";
import { ListShapeExecutor } from "../components/listShape/executor";

export const executorRegistry: Record<NodeType, NodeExecutor<any>> = {
  [NodeType.MANUAL_TRIGGER]: manualReqTriggerExecutor,
  [NodeType.INITIAL]: manualReqTriggerExecutor,
  [NodeType.HTTP_REQ]: HTTPReqTriggerExecutor,
  [NodeType.SET]: SetExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.WEBHOOK_TRIGGER]: webhookTriggerExecutor,
  [NodeType.TELEGRAM_TRIGGER]: telegramTriggerExecutor,
  [NodeType.TELEGRAM_SEND]: TelegramSendExecutor,
  [NodeType.DISCORD_TRIGGER]: discordTriggerExecutor,
  [NodeType.DISCORD_SEND]: DiscordExecutor,
  [NodeType.ZACHURL]: ZachurlExecutor,
  [NodeType.ZACHCOURSE]: ZachCourseExecutor,
  [NodeType.LOOP]: LoopExecutor,
  [NodeType.GEMINI]: GeminiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.OPENAI]: openAIExecutor,
  [NodeType.SLACK]: SlackExecutor,
  [NodeType.BLACK_LABS]: BlackForestExecutor,
  [NodeType.MERGE]: MergeExecutor,
  [NodeType.WAIT]: WaitExecutor,
  [NodeType.CONDITIONAL]: async () => {
    throw new NonRetriableError(
      "CONDITIONAL nodes must be handled by the workflow engine's inline branch logic, not the executor registry.",
    );
  },
  [NodeType.STICKY_NOTE]: async () => {
    throw new NonRetriableError(
      "SICKY NOTE nodes must be handled by the workflow engine's inline branch logic, not the executor registry.",
    );
  },
  [NodeType.SANDBOXED_CODE]: SandboxedCodeExecutor,
  [NodeType.FILTER]: FilterExecutor,
  [NodeType.LIST_SHAPE]: ListShapeExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor<any> => {
  const executor = executorRegistry[type];

  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }

  return executor;
};
