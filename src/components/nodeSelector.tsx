"use client";

import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { NodeType } from "@/generated/prisma/enums";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Badge } from "./ui/badge";
import { useHasActivePROSubscription } from "@/features/subscriptions/hooks/useSubscription";
import { cn } from "@/lib/utils";

import {
  executionNodes,
  isInitialNode,
  isSingletonNode,
  isTriggerNode,
  NodeTypeOption,
  triggerNodes,
} from "@/config/nodeTypes";

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

  const hasTrigger = useMemo(() => {
    const nodes = getNodes();
    return nodes.some((node) => isTriggerNode(node.type as import("@/generated/prisma/enums").NodeType));
  }, [getNodes, open]);

  const nodeOptions = hasTrigger ? executionNodes : triggerNodes;

  const handleNodeSelect = useCallback(
    (selection: NodeTypeOption) => {
      if (isSingletonNode(selection.type)) {
        const nodes = getNodes();
        const hasManualTrigger = nodes.some(
          (node) => node.type === selection.type,
        );

        if (hasManualTrigger) {
          toast.error("Only one Manual Trigger is allowed per Workflow.");
          return;
        }
      }

      setNodes((nodes) => {
        const hasInitialTrigger = nodes.some(
          (node) => isInitialNode(node.type as NodeType),
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
          <SheetTitle>
            {hasTrigger
              ? "What should happen next?"
              : "What triggers this WORKFLOW?"}
          </SheetTitle>
          <SheetDescription>
            {hasTrigger
              ? "Add a step that runs after your trigger."
              : "A TRIGGER is a step that starts your WORKFLOW"}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-1 mt-4">
          {nodeOptions.map((nodeType) => {
            const proOnly =
              nodeType.pro && (isLoading || !hasActivePROSubscription);
            const Icon = nodeType.icon;
            return (
              <div
                key={nodeType.type}
                className={cn(
                  "w-full flex items-center gap-3 justify-start h-auto py-3 px-4 rounded border-l-4",
                  proOnly
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer border-transparent hover:border-l-primary hover:bg-muted/50",
                )}
                onClick={() => {
                  if (proOnly) {
                    toast.error("This node requires PRO.");
                    return;
                  }

                  handleNodeSelect(nodeType);
                }}
              >
                {typeof Icon === "string" ? (
                  <img src={Icon} alt="" className="size-5 shrink-0" />
                ) : (
                  <Icon className="size-5 shrink-0" />
                )}
                <div className="flex flex-col text-left">
                  <span className="font-medium text-sm">
                    {nodeType.label}
                    {nodeType.pro ? (
                      <Badge
                        variant="outline"
                        className="ml-2 border-blue-500/40 text-blue-400 bg-blue-500/10"
                      >
                        PRO
                      </Badge>
                    ) : null}
                  </span>
                  {nodeType.description ? (
                    <span className="text-xs text-muted-foreground">
                      {nodeType.description}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
