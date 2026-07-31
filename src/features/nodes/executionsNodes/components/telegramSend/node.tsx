"use client";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { TelegramSendDialog, TelegramSendFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type TelegramSendNodeData = {
  variableName?: string;
  credentialId?: string;
  chatId?: string;
  message?: string;
  status?: NodeStatus;
};

export type TelegramSendNodeType = Node<TelegramSendNodeData>;

export const TelegramSendNode = (props: NodeProps<TelegramSendNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const submit = (values: TelegramSendFormValues) =>
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.TELEGRAM_SEND,
    topics: ["status"],
  });
  return (
    <>
      <TelegramSendDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={submit}
        defaultValues={props.data}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon="/telegram.svg"
        name="Telegram Send"
        description="Send a Telegram message"
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
      />
    </>
  );
};
TelegramSendNode.displayName = "Telegram Send Node";
