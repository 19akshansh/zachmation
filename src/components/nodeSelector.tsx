"use client";

import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import { GlobeIcon,
  LinkIcon, MousePointerIcon, PencilLineIcon, WebhookIcon } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { NodeType } from "@/generated/prisma/enums";
import { Separator } from "./ui/separator";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useHasActivePROSubscription } from "@/features/subscriptions/hooks/useSubscription";
import { cn } from "@/lib/utils";

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
};

const triggerNodes: NodeTypeOption[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Execute Workflow Manually",
    description: "Runs the flow on clicking a button, Good for first start",
    icon: MousePointerIcon,
    pro: false,
  },
  {
    type: NodeType.GOOGLE_FORM_TRIGGER,
    label: "Google Form Trigger",
    description: "Triggers a Google Form Submission",
    icon: "/gforms.svg",
    pro: false,
  },
  {
    type: NodeType.STRIPE_TRIGGER,
    label: "Stripe Event",
    description: "Triggers a Stripe Event",
    icon: "/stripe.svg",
    pro: true,
  },
  {
    type: NodeType.WEBHOOK_TRIGGER,
    label: "Webhook Trigger",
    description: "Triggers from any incoming webhook POST",
    icon: WebhookIcon,
    pro: false,
  },
  {
    type: NodeType.DISCORD_TRIGGER,
    label: "Discord Trigger",
    description: "Triggers from a Discord interaction or slash command",
    icon: "/discord.svg",
    pro: false,
  },
  {
    type: NodeType.TELEGRAM_TRIGGER,
    label: "Telegram Trigger",
    description: "Triggers when your Telegram bot receives an update",
    icon: "/telegram.svg",
    pro: false,
  },
];

const executionNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQ,
    label: "HTTP Request",
    description: "Makes an HTTP Request",
    icon: GlobeIcon,
    pro: false,
  },
  {
    type: NodeType.SET,
    label: "Edit Fields",
    description: "Add or reshape workflow context fields",
    icon: PencilLineIcon,
    pro: false,
  },
  {
    type: NodeType.GEMINI,
    label: "GEMINI Chat",
    description: "Makes a GEMINI(Chat) Request",
    icon: "/gemini.svg",
    pro: false,
  },
  {
    type: NodeType.OPENAI,
    label: "OPENAI Chat",
    description: "Makes a OPENAI(Chat) Request",
    icon: "/openai.svg",
    pro: true,
  },
  {
    type: NodeType.ANTHROPIC,
    label: "Anthropic Chat",
    description: "Makes a Anthropic(Chat) Request",
    icon: "/anthropic.svg",
    pro: true,
  },
  {
    type: NodeType.ZACHURL,
    label: "Zachurl",
    description: "Create a short URL with Zachurl",
    icon: LinkIcon,
    pro: false,
  },
  {
    type: NodeType.BLACK_LABS,
    label: "Black Labs Image Gen",
    description: "Makes a Black Labs(Image) Request",
    icon: "/blackforest.svg",
    pro: true,
  },
  {
    type: NodeType.DISCORD_SEND,
    label: "Discord Send",
    description: "Send a Discord Message",
    icon: "/discord.svg",
    pro: false,
  },
  {
    type: NodeType.TELEGRAM_SEND,
    label: "Telegram Send",
    description: "Send a Telegram message",
    icon: "/telegram.svg",
    pro: false,
  },
  {
    type: NodeType.SLACK,
    label: "Slack",
    description: "Send a Slack Message",
    icon: "/slack.svg",
    pro: true,
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function NodeSelector({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
  const { hasActivePROSubscription, isLoading } = useHasActivePROSubscription();

  const handleNodeSelect = useCallback(
    (selection: NodeTypeOption) => {
      if (selection.type === NodeType.MANUAL_TRIGGER) {
        const nodes = getNodes();
        const hasManualTrigger = nodes.some(
          (node) => node.type === NodeType.MANUAL_TRIGGER,
        );

        if (hasManualTrigger) {
          toast.error("Only one Manual Trigger is allowed per Workflow.");
          return;
        }
      }

      setNodes((nodes) => {
        const hasInitialTrigger = nodes.some(
          (node) => node.type === NodeType.INITIAL,
        );

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });

        const newNode = {
          id: createId(),
          data: {},
          position: flowPosition,
          type: selection.type,
        };

        if (hasInitialTrigger) {
          return [newNode];
        }
        return [...nodes, newNode];
      });

      onOpenChange(false);
    },
    [setNodes, getNodes, onOpenChange, screenToFlowPosition],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto p-4"
      >
        <SheetHeader>
          <SheetTitle>What triggers this {"WORKFLOW"} ?</SheetTitle>
          <SheetDescription>
            A {"TRIGGER"} is a step that starts your {"WORKFLOW"}
          </SheetDescription>
        </SheetHeader>
        <div>
          {triggerNodes.map((nodeType) => {
            const proOnly =
              nodeType.pro && (isLoading || !hasActivePROSubscription);
            const Icon = nodeType.icon;
            return (
              <div
                key={nodeType.type}
                className={cn(
                  "w-full justify-start h-auto py-5 px-4 rounded border-l-4",
                  proOnly
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer border-transparent hover:border-l-primary",
                )}
                onClick={() => {
                  if (proOnly) {
                    toast.error("This node requires PRO.");
                    return;
                  }

                  handleNodeSelect(nodeType);
                }}
              >
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof Icon === "string" ? (
                    <img
                      src={Icon}
                      alt={nodeType.label}
                      className="size-5 object-contain rounded-sm"
                    />
                  ) : (
                    <Icon className="size-5" />
                  )}
                  <div className="flex flex-col items-start text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {nodeType.label}
                      </span>

                      {nodeType.pro && (
                        <span className="rounded-md border border-primary px-2 py-0.5 text-xs text-primary">
                          PRO
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {nodeType.description}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Separator />
        <div>
          {executionNodes.map((nodeType) => {
            const proOnly =
              nodeType.pro && (isLoading || !hasActivePROSubscription);
            const Icon = nodeType.icon;
            return (
              <div
                key={nodeType.type}
                className={cn(
                  "w-full justify-start h-auto py-5 px-4 rounded border-l-4",
                  proOnly
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer border-transparent hover:border-l-primary",
                )}
                onClick={() => {
                  if (proOnly) {
                    toast.error("This node requires PRO.");
                    return;
                  }

                  handleNodeSelect(nodeType);
                }}
              >
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof Icon === "string" ? (
                    <img
                      src={Icon}
                      alt={nodeType.label}
                      className="size-5 object-contain rounded-sm"
                    />
                  ) : (
                    <Icon className="size-5" />
                  )}
                  <div className="flex flex-col items-start text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {nodeType.label}
                      </span>

                      {nodeType.pro && (
                        <span className="rounded-md border border-primary px-2 py-0.5 text-xs text-primary">
                          PRO
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {nodeType.description}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
