"use client";

import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { GitBranchIcon } from "lucide-react";
import { useState } from "react";
import { BaseNode, BaseNodeContent } from "@/components/reactFlow/base-node";
import { BaseHandle } from "@/components/reactFlow/base-handle";
import { WorkflowNode } from "@/components/workflowNode";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { ConditionalDialog, ConditionalFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type ConditionalNodeData = ConditionalFormValues & { status?: NodeStatus };
export type ConditionalNodeType = Node<ConditionalNodeData>;

export const ConditionalNode = (props: NodeProps<ConditionalNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes, setEdges } = useReactFlow();
  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.CONDITIONAL,
    topics: ["status"],
  });

  const mode = props.data.mode ?? "if";
  const cases = props.data.cases ?? [];
  const labels = mode === "if" ? ["true", "false"] : [...cases.map((item) => item.label), "default"];

  const handleSubmit = (values: ConditionalFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== props.id));
    setEdges((edges) => edges.filter((edge) => edge.source !== props.id && edge.target !== props.id));
  };

  return (
    <>
      <ConditionalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <WorkflowNode
        name={mode === "if" ? "If" : "Switch"}
        description={mode === "if" ? "Route on a condition" : "Route by matching a value"}
        onDelete={handleDelete}
        onSettings={() => setDialogOpen(true)}
      >
        <BaseNode
          status={props.data.status || "initial"}
          onDoubleClick={() => setDialogOpen(true)}
          className="min-w-[250px] overflow-visible border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md"
        >
          <BaseNodeContent className="p-0">
            <div className="flex items-center gap-3 border-b bg-muted/20 px-3 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                <GitBranchIcon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-none">{mode === "if" ? "If" : "Switch"}</p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">
                  {mode === "if" ? `${props.data.operator ?? "equals"}` : `${cases.length} case${cases.length === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>

            <div className="px-3 py-3">
              <div className="rounded-md bg-muted/40 px-2.5 py-2 text-xs">
                <span className="text-muted-foreground">{mode === "if" ? "Condition" : "Value"}</span>
                <p className="mt-1 truncate font-mono font-medium">
                  {mode === "if" ? props.data.leftValue || "Configure condition" : props.data.switchValue || "Configure switch"}
                </p>
              </div>
            </div>

            <div className="space-y-1 border-t px-3 py-2.5">
              {labels.map((label) => (
                <div key={label} className="relative flex h-7 items-center justify-end pr-5 text-xs font-medium text-muted-foreground">
                  <span className={label === "default" ? "rounded-full bg-muted px-2 py-0.5" : "rounded-full bg-primary/10 px-2 py-0.5 text-primary"}>
                    {label}
                  </span>
                  <BaseHandle
                    id={label}
                    type="source"
                    position={Position.Right}
                    className="!right-[-5px]"
                  />
                </div>
              ))}
            </div>

            <BaseHandle id="target-1" type="target" position={Position.Left} className="!left-[-5px]" />
          </BaseNodeContent>
        </BaseNode>
      </WorkflowNode>
    </>
  );
};

ConditionalNode.displayName = "If / Switch Node";
