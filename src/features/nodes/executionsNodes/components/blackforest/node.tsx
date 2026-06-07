"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { useMemo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { BlackForestDialog, BlackForestFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";
import {
  BLACK_FOREST_MODELS,
  BlackForestModelId,
} from "@/config/ai/blackforestModels";

type BlackForestModel = (typeof BLACK_FOREST_MODELS)[number];

export type BlackForestNodeData = {
  variableName?: string;
  credentialId?: string;
  imgbbCredentialId?: string;
  model?: BlackForestModelId;
  prompt?: string;
  status?: NodeStatus;
};

export type BlackForestNodeType = Node<BlackForestNodeData>;

export const BlackForestNode = (props: NodeProps<BlackForestNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: BlackForestFormValues) => {
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
    return BLACK_FOREST_MODELS.find(
      (model: BlackForestModel) => model.id === nodeData?.model,
    );
  }, [nodeData?.model]);

  const description = selectedModel
    ? `${selectedModel.label.split(" (")[0]}${
        nodeData?.variableName ? ` • {{${nodeData.variableName}}}` : ""
      }`
    : "Not configured";

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.BLACK_FOREST,
    topics: ["status"],
  });

  return (
    <>
      <BlackForestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={{
          variableName: nodeData?.variableName,
          model: nodeData?.model,
          prompt: nodeData?.prompt,
          credentialId: nodeData?.credentialId,
          imgbbCredentialId: nodeData?.imgbbCredentialId,
        }}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon="/blackforest.svg"
        name="Black Forest (FLUX)"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
};

BlackForestNode.displayName = "Black Forest Node";
