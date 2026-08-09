"use client";

import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { Clock3Icon } from "lucide-react";
import { useState } from "react";
import { BaseNode, BaseNodeContent } from "@/components/reactFlow/base-node";
import { BaseHandle } from "@/components/reactFlow/base-handle";
import { WorkflowNode } from "@/components/workflowNode";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";
import { WaitDialog, WaitFormValues } from "./dialog";

export type WaitNodeData = WaitFormValues & { status?: NodeStatus };
export type WaitNodeType = Node<WaitNodeData>;

export const WaitNode = (props: NodeProps<WaitNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes, setEdges } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.WAIT,
    topics: ["status"],
  });

  const handleSubmit = (values: WaitFormValues) => {
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
    setEdges((edges) =>
      edges.filter(
        (edge) => edge.source !== props.id && edge.target !== props.id,
      ),
    );
  };

  const mode = props.data.mode ?? "duration";
  const variableName = props.data.variableName?.trim();
  const durationMs = props.data.durationMs ?? 10_000;
  const durationSeconds = Math.max(1, Math.round(durationMs / 1000));

  return (
    <>
      <WaitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
        nodeId={props.id}
      />

      <WorkflowNode
        name="Wait"
        description={
          mode === "webhook"
            ? "Pause until a webhook resumes it"
            : `Pause for ${durationSeconds}s`
        }
        onDelete={handleDelete}
        onSettings={() => setDialogOpen(true)}
      >
        <BaseNode
          status={props.data.status || "initial"}
          onDoubleClick={() => setDialogOpen(true)}
          className="min-w-[210px] overflow-visible border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md"
        >
          <BaseNodeContent className="gap-0 p-0">
            <div className="flex items-center gap-3 border-b bg-muted/20 px-3 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                <Clock3Icon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-none">Wait</p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">
                  {mode === "webhook" ? "Resume by webhook" : `Delay ${durationSeconds}s`}
                </p>
              </div>
            </div>

            <div className="relative px-3 py-3">
              <div className="rounded-md bg-muted/40 px-2.5 py-2 text-xs">
                <span className="text-muted-foreground">
                  {mode === "webhook" ? "Response" : "After wait"}
                </span>
                <p className="mt-1 truncate font-mono font-medium">
                  {mode === "webhook"
                    ? variableName || "continue workflow"
                    : "continue workflow"}
                </p>
              </div>
              <BaseHandle
                id="target-1"
                type="target"
                position={Position.Left}
                className="!left-[-5px]"
              />
              <BaseHandle
                id="source-1"
                type="source"
                position={Position.Right}
                className="!right-[-5px]"
              />
            </div>
          </BaseNodeContent>
        </BaseNode>
      </WorkflowNode>
    </>
  );
};

WaitNode.displayName = "Wait Node";
