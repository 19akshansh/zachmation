"use client";

import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { CHANNELS } from "@/config/channels";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { BaseTriggerNode } from "../baseTriggerNode";
import { DiscordTriggerDialog } from "./dialog";

type DiscordTriggerNodeData = {
  publicKey?: string;
  status?: NodeStatus;
};

type DiscordTriggerNodeType = Node<DiscordTriggerNodeData>;

export const DiscordTriggerNode = memo(
  (props: NodeProps<DiscordTriggerNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    useNodeStatus({
      nodeId: props.id,
      channel: CHANNELS.DISCORD_TRIGGER,
      topics: ["status"],
    });

    const handleSubmit = (publicKey: string) => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === props.id
            ? { ...node, data: { ...node.data, publicKey } }
            : node,
        ),
      );
    };

    return (
      <>
        <DiscordTriggerDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          publicKey={props.data.publicKey}
          onSubmit={handleSubmit}
        />
        <BaseTriggerNode
          {...props}
          icon="/discord.svg"
          name="Discord Trigger"
          description={
            props.data.publicKey
              ? "When Discord sends an interaction"
              : "Configure a Discord Interactions endpoint"
          }
          onSettings={() => setDialogOpen(true)}
          onDoubleClick={() => setDialogOpen(true)}
          status={props.data.status || "initial"}
        />
      </>
    );
  },
);

DiscordTriggerNode.displayName = "DiscordTriggerNode";
