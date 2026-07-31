"use client";

import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { CHANNELS } from "@/config/channels";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { BaseTriggerNode } from "../baseTriggerNode";
import { TelegramTriggerDialog } from "./dialog";

type TelegramTriggerNodeData = {
  credentialId?: string;
  telegramSecretToken?: string;
  status?: NodeStatus;
};

type TelegramTriggerNodeType = Node<TelegramTriggerNodeData>;

export const TelegramTriggerNode = memo(
  (props: NodeProps<TelegramTriggerNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    useNodeStatus({
      nodeId: props.id,
      channel: CHANNELS.TELEGRAM_TRIGGER,
      topics: ["status"],
    });

    const handleRegistered = (credentialId: string) => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === props.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  credentialId,
                },
              }
            : node,
        ),
      );
    };

    return (
      <>
        <TelegramTriggerDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          nodeId={props.id}
          credentialId={props.data.credentialId}
          onRegistered={handleRegistered}
        />

        <BaseTriggerNode
          {...props}
          icon="/telegram.svg"
          name="Telegram"
          description={
            props.data.credentialId
              ? "When the Telegram bot receives an update"
              : "Register a Telegram bot webhook"
          }
          onSettings={() => setDialogOpen(true)}
          onDoubleClick={() => setDialogOpen(true)}
          status={props.data.status || "initial"}
        />
      </>
    );
  },
);

TelegramTriggerNode.displayName = "TelegramTriggerNode";
