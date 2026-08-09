"use client";

import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { type LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode } from "react";
import { NodeType } from "@/generated/prisma/enums";
import { PINNABLE_NODES } from "@/config/nodeTypes";
import {
  usePinNode,
  useUnpinNode,
} from "@/features/workflows/hooks/useWorkflows";
import { BaseNode, BaseNodeContent } from "@/components/reactFlow/base-node";
import { BaseHandle } from "@/components/reactFlow/base-handle";
import { WorkflowNode } from "@/components/workflowNode";
import {
  type NodeStatus,
  NodeStatusIndicator,
} from "@/components/reactFlow/node-status-indicator";

interface BaseExecutionNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  status?: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export const BaseExecutionNode = memo(
  ({
    id,
    type,
    data,
    icon: Icon,
    name,
    description,
    children,
    status = "initial",
    onSettings,
    onDoubleClick,
  }: BaseExecutionNodeProps) => {
    const { setNodes, setEdges } = useReactFlow();
    const pinNode = usePinNode();
    const unpinNode = useUnpinNode();

    const nodeData = (data ?? {}) as Record<string, unknown>;
    const canPin = PINNABLE_NODES.has(type as NodeType);
    const variableName =
      typeof nodeData.variableName === "string"
        ? nodeData.variableName.trim()
        : "";
    const pinned = nodeData.__pinned === true;

    const handlePin = () => {
      if (!canPin || !variableName) return;
      if (pinned) {
        unpinNode.mutate(
          { nodeId: id },
          {
            onSuccess: () =>
              setNodes((nodes) =>
                nodes.map((node) =>
                  node.id === id
                    ? { ...node, data: { ...node.data, __pinned: false } }
                    : node,
                ),
              ),
          },
        );
        return;
      }

      pinNode.mutate(
        { nodeId: id },
        {
          onSuccess: () =>
            setNodes((nodes) =>
              nodes.map((node) =>
                node.id === id
                  ? { ...node, data: { ...node.data, __pinned: true } }
                  : node,
              ),
            ),
        },
      );
    };

    const handleDelete = () => {
      setNodes((currentNodes) => {
        const updateNodes = currentNodes.filter((node) => node.id !== id);
        return updateNodes;
      });

      setEdges((currentEdges) => {
        const updateEdges = currentEdges.filter(
          (edge) => edge.source !== id && edge.target !== id,
        );

        return updateEdges;
      });
    };
    return (
      <WorkflowNode
        name={name}
        description={description}
        onDelete={handleDelete}
        onSettings={onSettings}
        pinned={pinned}
        onPin={canPin ? handlePin : undefined}
        pinDisabled={!variableName || pinNode.isPending || unpinNode.isPending}
      >
        <NodeStatusIndicator status={status} variant="border">
          <BaseNode
            status={status}
            onDoubleClick={onDoubleClick}
            className={
              pinned
                ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background"
                : undefined
            }
          >
            <BaseNodeContent>
              {typeof Icon === "string" ? (
                <Image src={Icon} alt={name} width={16} height={16} />
              ) : (
                <Icon className="size-4 text-muted-foreground" />
              )}
              {children}
              <BaseHandle
                id={"target-1"}
                type="target"
                position={Position.Left}
              />
              <BaseHandle
                id={"source-1"}
                type="source"
                position={Position.Right}
              />
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    );
  },
);

BaseExecutionNode.displayName = "BaseExecutionNode";
