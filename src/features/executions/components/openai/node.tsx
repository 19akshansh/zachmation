"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { useMemo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { OpenAIDialog, OpenAIFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";
import { OPENAI_MODELS, OpenAIModelId } from "@/config/ai/openaiModels";

export type OpenAIData = {
  variableName?: string;
  credentialId?: string;
  model?: OpenAIModelId;
  systemPrompt?: string;
  userPrompt?: string;
  status?: NodeStatus;
};

export type OpenAINodeType = Node<OpenAIData>;

export const OpenAINode = (props: NodeProps<OpenAINodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeData = props.data;

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: OpenAIFormValues) => {
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
    return OPENAI_MODELS.find((model) => model.id === nodeData?.model);
  }, [nodeData?.model]);

  const description = selectedModel
    ? `${selectedModel.label}${
        nodeData?.variableName ? ` • {{${nodeData.variableName}}}` : ""
      }`
    : "Not configured";

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.OPENAI,
    topics: ["status"],
  });

  return (
    <>
      <OpenAIDialog
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
        icon="/openai.svg"
        name="OpenAI (Chat) Node"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
};

OpenAINode.displayName = "OpenAINode";
