"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { Code2Icon } from "lucide-react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";
import { SandboxedCodeDialog, SandboxedCodeFormValues } from "./dialog";

export type SandboxedCodeNodeData = SandboxedCodeFormValues & {
  status?: NodeStatus;
};

export type SandboxedCodeNodeType = Node<SandboxedCodeNodeData>;

export const SandboxedCodeNode = (props: NodeProps<SandboxedCodeNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.SANDBOXED_CODE,
    topics: ["status"],
  });

  const handleSubmit = (values: SandboxedCodeFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const language = props.data.language ?? "javascript";
  const variableName = props.data.variableName?.trim();

  return (
    <>
      <SandboxedCodeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon={Code2Icon}
        name="Sandboxed Code"
        description={
          variableName
            ? `${language === "python" ? "Python" : "JavaScript"} → ${variableName}`
            : "Run JavaScript or Python"
        }
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
      />
    </>
  );
};

SandboxedCodeNode.displayName = "Sandboxed Code Node";
