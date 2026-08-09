import {
  GitBranchIcon,
  GlobeIcon,
  MousePointerIcon,
  PencilLineIcon,
  Repeat2Icon,
  WebhookIcon,
} from "lucide-react";
import { NodeType } from "@/generated/prisma/enums";

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon:
    | React.ComponentType<{
        className?: string;
      }>
    | string;
  pro?: boolean;
  pinnable?: boolean;
};

export const triggerNodes: NodeTypeOption[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Execute Workflow Manually",
    description: "Runs the flow on clicking a button, Good for first start",
    icon: MousePointerIcon,
    pro: false,
    pinnable: false,
  },
  {
    type: NodeType.GOOGLE_FORM_TRIGGER,
    label: "Google Form Trigger",
    description: "Triggers a Google Form Submission",
    icon: "/gforms.svg",
    pro: false,
    pinnable: false,
  },
  {
    type: NodeType.STRIPE_TRIGGER,
    label: "Stripe Event",
    description: "Triggers a Stripe Event",
    icon: "/stripe.svg",
    pro: true,
    pinnable: false,
  },
  {
    type: NodeType.WEBHOOK_TRIGGER,
    label: "Webhook Trigger",
    description: "Triggers from any incoming webhook POST",
    icon: WebhookIcon,
    pro: false,
    pinnable: false,
  },
  {
    type: NodeType.DISCORD_TRIGGER,
    label: "Discord Trigger",
    description: "Triggers from a Discord interaction or slash command",
    icon: "/discord.svg",
    pro: false,
    pinnable: false,
  },
  {
    type: NodeType.TELEGRAM_TRIGGER,
    label: "Telegram Trigger",
    description: "Triggers when your Telegram bot receives an update",
    icon: "/telegram.svg",
    pro: false,
    pinnable: false,
  },
];

export const executionNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQ,
    label: "HTTP Request",
    description: "Makes an HTTP Request",
    icon: GlobeIcon,
    pro: false,
    pinnable: true,
  },
  {
    type: NodeType.SET,
    label: "Edit Fields",
    description: "Add or reshape workflow context fields",
    icon: PencilLineIcon,
    pro: false,
    pinnable: false,
  },
  {
    type: NodeType.LOOP,
    label: "Loop",
    description: "Run a branch once for each item in an array",
    icon: Repeat2Icon,
    pro: false,
    pinnable: false,
  },
   {
    type: NodeType.CONDITIONAL,
    label: "If / Switch",
    description: "Route execution through a conditional branch",
    icon: GitBranchIcon,
    pro: false,
    pinnable: false,
  },
  {
    type: NodeType.GEMINI,
    label: "GEMINI Chat",
    description: "Makes a GEMINI(Chat) Request",
    icon: "/gemini.svg",
    pro: false,
    pinnable: true,
  },
  {
    type: NodeType.OPENAI,
    label: "OPENAI Chat",
    description: "Makes a OPENAI(Chat) Request",
    icon: "/openai.svg",
    pro: true,
    pinnable: true,
  },
  {
    type: NodeType.ANTHROPIC,
    label: "Anthropic Chat",
    description: "Makes a Anthropic(Chat) Request",
    icon: "/anthropic.svg",
    pro: true,
    pinnable: true,
  },
  {
    type: NodeType.BLACK_LABS,
    label: "Black Labs Image Gen",
    description: "Makes a Black Labs(Image) Request",
    icon: "/blackforest.svg",
    pro: true,
    pinnable: true,
  },
  {
    type: NodeType.ZACHURL,
    label: "Zachurl",
    description: "Create a short URL with Zachurl",
    icon: "/zachurl.svg",
    pro: false,
    pinnable: true,
  },
  {
    type: NodeType.ZACHCOURSE,
    label: "ZachCourse",
    description: "Generate a personalized course with ZachCourse",
    icon: "/zachcourse.svg",
    pro: false,
    pinnable: true,
  },
  {
    type: NodeType.DISCORD_SEND,
    label: "Discord Send",
    description: "Send a Discord Message",
    icon: "/discord.svg",
    pro: false,
    pinnable: true,
  },
  {
    type: NodeType.TELEGRAM_SEND,
    label: "Telegram Send",
    description: "Send a Telegram message",
    icon: "/telegram.svg",
    pro: false,
    pinnable: true,
  },
  {
    type: NodeType.SLACK,
    label: "Slack",
    description: "Send a Slack Message",
    icon: "/slack.svg",
    pro: true,
    pinnable: true,
  },
];

export const ALL_NODE_TYPES: NodeTypeOption[] = [
  ...triggerNodes,
  ...executionNodes,
];
2;
export const PRO_NODES = new Set<NodeType>(
  ALL_NODE_TYPES.filter((option) => option.pro).map((option) => option.type),
);

export const PINNABLE_NODES = new Set<NodeType>(
  ALL_NODE_TYPES.filter((option) => option.pinnable).map(
    (option) => option.type,
  ),
);
