"use client";

import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { Repeat2Icon } from "lucide-react";
import { useState } from "react";
import { BaseNode, BaseNodeContent } from "@/components/reactFlow/base-node";
import { BaseHandle } from "@/components/reactFlow/base-handle";
import { WorkflowNode } from "@/components/workflowNode";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";
import { LoopDialog, LoopFormValues } from "./dialog";

export type LoopNodeData = LoopFormValues & { status?: NodeStatus };
export type LoopNodeType = Node<LoopNodeData>;

export const LoopNode = (props: NodeProps<LoopNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes, setEdges } = useReactFlow();

  const handleSubmit = (values: LoopFormValues) => {
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

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.LOOP,
    topics: ["status"],
  });

  const sourceKey = props.data.sourceKey?.trim();
  const variableName = props.data.variableName?.trim();

  return (
    <>
      <LoopDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={{
          sourceKey: props.data.sourceKey,
          variableName: props.data.variableName,
        }}
      />

      <WorkflowNode
        name="Loop"
        description={sourceKey ? `Iterate ${sourceKey}` : "Iterate an array"}
        onDelete={handleDelete}
        onSettings={() => setDialogOpen(true)}
      >
        <BaseNode
          status={props.data.status || "initial"}
          onDoubleClick={() => setDialogOpen(true)}
          className="min-w-[180px] overflow-visible border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md"
        >
          <BaseNodeContent className="gap-0 p-0">
            <div className="flex items-center gap-2 border-b bg-muted/20 px-2.5 py-2">
              <Repeat2Icon className="size-3.5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-medium">
                {sourceKey || "source"}
              </span>
              <span className="shrink-0 truncate font-mono text-[11px] text-muted-foreground">
                → {variableName || "-"}
              </span>
            </div>

            <div className="flex flex-col">
              <div className="relative flex h-6 items-center justify-end border-b border-dashed pr-5 text-[10px] font-medium text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-primary">
                  loop
                </span>
                <BaseHandle
                  id="loop"
                  type="source"
                  position={Position.Right}
                  className="!right-[-5px]"
                />
              </div>
              <div className="relative flex h-6 items-center justify-end pr-5 text-[10px] font-medium text-muted-foreground">
                <span className="rounded-full bg-muted px-1.5 py-0.5">
                  done
                </span>
                <BaseHandle
                  id="done"
                  type="source"
                  position={Position.Right}
                  className="!right-[-5px]"
                />
              </div>
            </div>

            <BaseHandle
              id="target-1"
              type="target"
              position={Position.Left}
              className="!left-[-5px]"
            />
          </BaseNodeContent>
        </BaseNode>
      </WorkflowNode>
    </>
  );
};

LoopNode.displayName = "Loop Node";
