import {
  GitBranchIcon,
  GitMergeIcon,
  Clock3Icon,
  GlobeIcon,
  MousePointerIcon,
  PencilLineIcon,
  Repeat2Icon,
  StickyNoteIcon,
  Code2Icon,
  WebhookIcon,
  ListFilterIcon,
  ListTreeIcon,
  CalendarClockIcon,
  MailIcon,
  TimerIcon,
  BrainCircuitIcon,
  BotIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import { CredentialType, NodeType } from "@/generated/prisma/enums";

export type NodeCategory = "trigger" | "execution" | "internal";

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }> | string;
  category: NodeCategory;
  pro: boolean;
  pinnable: boolean;
  credentialTypes: readonly CredentialType[];
  publicExportFields: readonly string[];
  hidden?: boolean;
  singleton?: boolean;
  manualExecutable?: boolean;
  engineRole?: "loop" | "conditional" | "visualOnly";
  scheduleTrigger?: boolean;
};

const nodeDefinitions: NodeTypeOption[] = [
  {
    type: NodeType.INITIAL,
    label: "Initial",
    description: "Internal workflow start node",
    icon: MousePointerIcon,
    category: "internal",
    pro: false,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: [],
    hidden: true,
  },
  {
    type: NodeType.CRON_TRIGGER,
    label: "Schedule / Cron",
    description: "Runs the workflow on a recurring cron schedule",
    icon: TimerIcon,
    category: "trigger",
    pro: true,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: ["cronExpression"],
    scheduleTrigger: true,
  },
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Execute Workflow Manually",
    description: "Runs the flow on clicking a button, Good for first start",
    icon: MousePointerIcon,
    category: "trigger",
    pro: false,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: [],
    singleton: true,
    manualExecutable: true,
  },
  {
    type: NodeType.GOOGLE_FORM_TRIGGER,
    label: "Google Form Trigger",
    description: "Triggers a Google Form Submission",
    icon: "/gforms.svg",
    category: "trigger",
    pro: false,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: [],
  },
  {
    type: NodeType.STRIPE_TRIGGER,
    label: "Stripe Event",
    description: "Triggers a Stripe Event",
    icon: "/stripe.svg",
    category: "trigger",
    pro: true,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: [],
  },
  {
    type: NodeType.WEBHOOK_TRIGGER,
    label: "Webhook Trigger",
    description: "Triggers from any incoming webhook POST",
    icon: WebhookIcon,
    category: "trigger",
    pro: true,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: [],
  },
  {
    type: NodeType.DISCORD_TRIGGER,
    label: "Discord Trigger",
    description: "Triggers from a Discord interaction or slash command",
    icon: "/discord.svg",
    category: "trigger",
    pro: false,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: ["publicKey"],
  },
  {
    type: NodeType.TELEGRAM_TRIGGER,
    label: "Telegram Trigger",
    description: "Triggers when your Telegram bot receives an update",
    icon: "/telegram.svg",
    category: "trigger",
    pro: false,
    pinnable: false,
    credentialTypes: [CredentialType.TELEGRAM_BOT],
    publicExportFields: [],
  },
  {
    type: NodeType.HTTP_REQ,
    label: "HTTP Request",
    description: "Makes an HTTP Request",
    icon: GlobeIcon,
    category: "execution",
    pro: false,
    pinnable: true,
    credentialTypes: [],
    publicExportFields: ["variableName", "endpoint", "method", "body"],
  },
  {
    type: NodeType.SET,
    label: "Edit Fields",
    description: "Add or reshape workflow context fields",
    icon: PencilLineIcon,
    category: "execution",
    pro: false,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: ["fields"],
  },
  {
    type: NodeType.LOOP,
    label: "Loop",
    description: "Run a branch once for each item in an array",
    icon: Repeat2Icon,
    category: "execution",
    pro: false,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: ["sourceKey", "variableName"],
    engineRole: "loop",
  },
  {
    type: NodeType.CONDITIONAL,
    label: "If / Switch",
    description: "Route execution through a conditional branch",
    icon: GitBranchIcon,
    category: "execution",
    pro: false,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: [
      "mode",
      "leftValue",
      "operator",
      "rightValue",
      "switchValue",
      "cases",
    ],
    engineRole: "conditional",
  },
  {
    type: NodeType.MERGE,
    label: "Merge",
    description: "Combine outputs from multiple branches",
    icon: GitMergeIcon,
    category: "execution",
    pro: false,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: ["variableName", "input1Key", "input2Key", "mode"],
  },
  {
    type: NodeType.STICKY_NOTE,
    label: "Sticky Note",
    description: "Add a note to your workflow canvas",
    icon: StickyNoteIcon,
    category: "execution",
    pro: false,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: ["text", "color", "width", "height"],
    engineRole: "visualOnly",
  },
  {
    type: NodeType.WAIT,
    label: "Wait / Delay",
    description:
      "Pause the workflow for a duration or until a webhook resumes it",
    icon: Clock3Icon,
    category: "execution",
    pro: false,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: ["mode", "durationMs", "variableName"],
  },
  {
    type: NodeType.SANDBOXED_CODE,
    label: "Code",
    description: "Run sandboxed JavaScript or Python against workflow context",
    icon: Code2Icon,
    category: "execution",
    pro: false,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: ["language", "variableName", "code"],
  },
  {
    type: NodeType.FILTER,
    label: "Filter",
    description: "Keep only array items that match a condition",
    icon: ListFilterIcon,
    category: "execution",
    pro: false,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: ["sourceKey", "variableName", "leftValue", "operator", "rightValue"],
  },
  {
    type: NodeType.LIST_SHAPE,
    label: "List Shape",
    description: "Sort, aggregate, or remove duplicate array items",
    icon: ListTreeIcon,
    category: "execution",
    pro: false,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: [
      "mode",
      "sourceKey",
      "variableName",
      "fieldPath",
      "sortDirection",
      "aggregateFieldName",
    ],
  },
  {
    type: NodeType.DATE_TIME,
    label: "Date & Time",
    description: "Format or shift dates in a context array",
    icon: CalendarClockIcon,
    category: "execution",
    pro: false,
    pinnable: false,
    credentialTypes: [],
    publicExportFields: [
      "sourceKey",
      "variableName",
      "dateValueTemplate",
      "operation",
      "formatPattern",
      "amount",
    ],
  },
  {
    type: NodeType.EMAIL_SEND,
    label: "Email / SMTP",
    description: "Send an email through an SMTP credential",
    icon: MailIcon,
    category: "execution",
    pro: false,
    pinnable: true,
    credentialTypes: [CredentialType.SMTP],
    publicExportFields: ["to", "subject", "body", "bodyType", "variableName"],
  },
  {
    type: NodeType.GOOGLE_SHEETS,
    label: "Google Sheets",
    description: "Read or append spreadsheet rows",
    icon: "/googleSheets.svg",
    category: "execution",
    pro: false,
    pinnable: true,
    credentialTypes: [CredentialType.GOOGLE_SHEETS],
    publicExportFields: [
      "operation",
      "spreadsheetId",
      "range",
      "rowValues",
      "variableName",
    ],
  },
  {
    type: NodeType.POSTGRES_QUERY,
    label: "Postgres Query",
    description: "Run a parameterized SELECT or INSERT query",
    icon: "/postgres.svg",
    category: "execution",
    pro: true,
    pinnable: true,
    credentialTypes: [CredentialType.POSTGRES],
    publicExportFields: ["query", "parameters", "variableName"],
  },
  {
    type: NodeType.AIRTABLE,
    label: "Airtable",
    description: "List, create, update, or delete Airtable records",
    icon: "/airtable.svg",
    category: "execution",
    pro: false,
    pinnable: true,
    credentialTypes: [CredentialType.AIRTABLE],
    publicExportFields: [
      "operation",
      "baseId",
      "tableName",
      "recordId",
      "fields",
      "variableName",
    ],
  },
  {
    type: NodeType.NOTION,
    label: "Notion",
    description: "Query databases and create or update Notion pages",
    icon: "/notion.svg",
    category: "execution",
    pro: false,
    pinnable: true,
    credentialTypes: [CredentialType.NOTION],
    publicExportFields: [
      "operation",
      "databaseId",
      "pageId",
      "properties",
      "variableName",
    ],
  },
  {
    type: NodeType.GITHUB,
    label: "GitHub",
    description: "Create, list, comment on, or close GitHub issues",
    icon: "/github.svg",
    category: "execution",
    pro: false,
    pinnable: true,
    credentialTypes: [CredentialType.GITHUB],
    publicExportFields: [
      "operation",
      "owner",
      "repo",
      "issueNumber",
      "title",
      "body",
      "state",
      "variableName",
    ],
  },
  {
    type: NodeType.VECTOR_STORE,
    label: "Vector Store",
    description: "Store and search workflow memory using semantic embeddings",
    icon: BrainCircuitIcon,
    category: "execution",
    pro: true,
    pinnable: true,
    credentialTypes: [CredentialType.GEMINI],
    publicExportFields: [
      "operation",
      "namespace",
      "content",
      "query",
      "limit",
      "variableName",
    ],
  },
  {
    type: NodeType.AGENT,
    label: "Agent",
    description: "Run a tool-using Gemini agent with optional vector memory",
    icon: BotIcon,
    category: "execution",
    pro: true,
    pinnable: true,
    credentialTypes: [CredentialType.GEMINI],
    publicExportFields: [
      "systemPrompt",
      "userMessage",
      "memoryNamespace",
      "maxSteps",
      "variableName",
    ],
  },
  {
    type: NodeType.GEMINI,
    label: "GEMINI Chat",
    description: "Makes a GEMINI(Chat) Request",
    icon: "/gemini.svg",
    category: "execution",
    pro: false,
    pinnable: true,
    credentialTypes: [CredentialType.GEMINI],
    publicExportFields: ["model", "systemPrompt", "userPrompt", "variableName"],
  },
  {
    type: NodeType.OPENAI,
    label: "OPENAI Chat",
    description: "Makes a OPENAI(Chat) Request",
    icon: "/openai.svg",
    category: "execution",
    pro: true,
    pinnable: true,
    credentialTypes: [CredentialType.OPENAI],
    publicExportFields: ["model", "systemPrompt", "userPrompt", "variableName"],
  },
  {
    type: NodeType.ANTHROPIC,
    label: "Anthropic Chat",
    description: "Makes a Anthropic(Chat) Request",
    icon: "/anthropic.svg",
    category: "execution",
    pro: true,
    pinnable: true,
    credentialTypes: [CredentialType.ANTHROPIC],
    publicExportFields: ["model", "systemPrompt", "userPrompt", "variableName"],
  },
  {
    type: NodeType.BLACK_LABS,
    label: "Black Labs Image Gen",
    description: "Makes a Black Labs(Image) Request",
    icon: "/blackforest.svg",
    category: "execution",
    pro: true,
    pinnable: true,
    credentialTypes: [CredentialType.HUGGING_FACE, CredentialType.IMG_BB],
    publicExportFields: ["model", "prompt", "variableName"],
  },
  {
    type: NodeType.ZACHURL,
    label: "Zachurl",
    description: "Create a short URL with Zachurl",
    icon: "/zachurl.svg",
    category: "execution",
    pro: false,
    pinnable: true,
    credentialTypes: [CredentialType.ZACHURL],
    publicExportFields: ["originalUrl", "customSlug", "variableName"],
  },
  {
    type: NodeType.ZACHCOURSE,
    label: "ZachCourse",
    description: "Generate a personalized course with ZachCourse",
    icon: "/zachcourse.svg",
    category: "execution",
    pro: false,
    pinnable: true,
    credentialTypes: [CredentialType.ZACHCOURSE, CredentialType.GEMINI],
    publicExportFields: [
      "topic",
      "sourceUrl",
      "textContent",
      "documentContext",
      "language",
      "experienceLevel",
      "backgroundContext",
      "weeklyHours",
      "tone",
      "variableName",
    ],
  },
  {
    type: NodeType.DISCORD_SEND,
    label: "Discord Send",
    description: "Send a Discord Message",
    icon: "/discord.svg",
    category: "execution",
    pro: false,
    pinnable: true,
    credentialTypes: [],
    publicExportFields: ["username", "content", "variableName"],
  },
  {
    type: NodeType.TELEGRAM_SEND,
    label: "Telegram Send",
    description: "Send a Telegram message",
    icon: "/telegram.svg",
    category: "execution",
    pro: false,
    pinnable: true,
    credentialTypes: [CredentialType.TELEGRAM_BOT],
    publicExportFields: ["chatId", "message", "variableName"],
  },
  {
    type: NodeType.SLACK,
    label: "Slack",
    description: "Send a Slack Message",
    icon: "/slack.svg",
    category: "execution",
    pro: true,
    pinnable: true,
    credentialTypes: [],
    publicExportFields: ["content", "variableName"],
  },
];

export const ALL_NODE_TYPES = nodeDefinitions;

export const triggerNodes = nodeDefinitions.filter(
  (node) => node.category === "trigger",
);

export const executionNodes = nodeDefinitions.filter(
  (node) => node.category === "execution",
);

export const PRO_NODES = new Set<NodeType>(
  nodeDefinitions.filter((node) => node.pro).map((node) => node.type),
);

export const PINNABLE_NODES = new Set<NodeType>(
  nodeDefinitions.filter((node) => node.pinnable).map((node) => node.type),
);

const nodeDefinitionMap = new Map(
  nodeDefinitions.map((node) => [node.type, node] as const),
);

const missingNodeDefinitions = Object.values(NodeType).filter(
  (type) => !nodeDefinitionMap.has(type),
);

if (missingNodeDefinitions.length > 0) {
  throw new Error(
    `Missing node configuration for: ${missingNodeDefinitions.join(", ")}`,
  );
}

export const getNodeDefinition = (type: NodeType): NodeTypeOption => {
  const definition = nodeDefinitionMap.get(type);

  if (!definition) {
    throw new Error(`No node definition found for node type: ${type}`);
  }

  return definition;
};

export const getNodeCredentialTypes = (type: NodeType) =>
  nodeDefinitionMap.get(type)?.credentialTypes ?? [];

export const getPrimaryNodeCredentialType = (type: NodeType) => {
  const credentialType = getNodeCredentialTypes(type)[0];

  if (!credentialType) {
    throw new Error(`Node type ${type} does not require a credential`);
  }

  return credentialType;
};

export const getPublicExportFields = (type: NodeType) =>
  nodeDefinitionMap.get(type)?.publicExportFields ?? [];


export const isInitialNode = (type: NodeType) =>
  nodeDefinitionMap.get(type)?.type === NodeType.INITIAL;

export const isSingletonNode = (type: NodeType) =>
  nodeDefinitionMap.get(type)?.singleton === true;

export const isManualExecutableNode = (type: NodeType) =>
  nodeDefinitionMap.get(type)?.manualExecutable === true;

export const isLoopNode = (type: NodeType) =>
  nodeDefinitionMap.get(type)?.engineRole === "loop";

export const isConditionalNode = (type: NodeType) =>
  nodeDefinitionMap.get(type)?.engineRole === "conditional";

export const isVisualOnlyNode = (type: NodeType) =>
  nodeDefinitionMap.get(type)?.engineRole === "visualOnly";

export const isScheduleTriggerNode = (type: NodeType) =>
  nodeDefinitionMap.get(type)?.scheduleTrigger === true;

export const getScheduleTriggerTypes = () =>
  nodeDefinitions
    .filter((node) => node.scheduleTrigger)
    .map((node) => node.type);

export const isProNode = (type: NodeType) =>
  nodeDefinitionMap.get(type)?.pro === true;

export const isPinnableNode = (type: NodeType) =>
  nodeDefinitionMap.get(type)?.pinnable === true;

export const isTriggerNode = (type: NodeType) =>
  nodeDefinitionMap.get(type)?.category === "trigger";
