"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { useMemo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { AnthropicDialog, AnthropicFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";
import {
  ANTHROPIC_MODELS,
  AnthropicModelId,
} from "@/config/ai/anthropicModels";

export type AnthropicData = {
  variableName?: string;
  credentialId?: string;
  model?: AnthropicModelId;
  systemPrompt?: string;
  userPrompt?: string;
  status?: NodeStatus;
};

export type AnthropicNodeType = Node<AnthropicData>;

export const AnthropicNode = (props: NodeProps<AnthropicNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const nodeData = props.data;

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: AnthropicFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id !== props.id) {
          return node;
        }

        return {
          ...node,
          data: {
            ...node.data,
            ...values,
          },
        };
      }),
    );
  };

  const selectedModel = useMemo(() => {
    return ANTHROPIC_MODELS.find((model) => model.id === nodeData?.model);
  }, [nodeData?.model]);

  const description = selectedModel
    ? `${selectedModel.label}${
        nodeData?.variableName ? ` • {{${nodeData.variableName}}}` : ""
      }`
    : "Not configured";

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.ANTHROPIC,
    topics: ["status"],
  });

  return (
    <>
      <AnthropicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={{
          variableName: nodeData?.variableName,
          model: nodeData?.model,
          systemPrompt: nodeData?.systemPrompt,
          userPrompt: nodeData?.userPrompt,
        }}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={nodeData.status || "initial"}
        icon="/anthropic.svg"
        name="Anthropic (Chat) Node"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
};

AnthropicNode.displayName = "Anthropic Node";
