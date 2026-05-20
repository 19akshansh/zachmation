"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { useMemo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { GeminiDialog, GeminiFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { geminiChannel } from "@/inngest/channels/ai/gemini";
import { GOOGLE_MODELS, GoogleModelId } from "@/config/ai/geminiModels";

export type GeminiNodeData = {
  variableName?: string;
  model?: GoogleModelId;
  systemPrompt?: string;
  userPrompt?: string;
  status?: NodeStatus;
};

export type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = (props: NodeProps<GeminiNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: GeminiFormValues) => {
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
  const nodeData = props.data;
  const selectedModel = useMemo(() => {
    return GOOGLE_MODELS.find((model) => model.id === nodeData?.model);
  }, [nodeData?.model]);
  const description = selectedModel
    ? `${selectedModel.label}${
        nodeData?.variableName ? ` • {{${nodeData.variableName}}}` : ""
      }`
    : "Not configured";

  useNodeStatus({
    nodeId: props.id,
    channel: geminiChannel.name,
    topics: ["status"],
  });

  return (
    <>
      <GeminiDialog
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
        status={props.data.status || "initial"}
        icon="/gemini.svg"
        name="Gemini (Chat) Node"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
};

GeminiNode.displayName = "Gemini Node";
