"use client";

import { CHANNELS } from "@/config/channels";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { Node, NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { WebhookIcon } from "lucide-react";
import { BaseTriggerNode } from "../baseTriggerNode";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { WebhookDialogTrigger } from "./dialog";

type WebhookTriggerNodeData = { status?: NodeStatus };
type WebhookTriggerNodeType = Node<WebhookTriggerNodeData>;

export const WebhookTriggerNode = memo(
  (props: NodeProps<WebhookTriggerNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const handleOpenSettings = () => setDialogOpen(true);

    useNodeStatus({
      nodeId: props.id,
      channel: CHANNELS.WEBHOOK_TRIGGER,
      topics: ["status"],
    });

    return (
      <>
        <WebhookDialogTrigger open={dialogOpen} onOpenChange={setDialogOpen} />
        <BaseTriggerNode
          {...props}
          icon={WebhookIcon}
          name="Webhook"
          description="When an incoming webhook is received"
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
          status={props.data.status || "initial"}
        />
      </>
    );
  },
);

WebhookTriggerNode.displayName = "WebhookTriggerNode";
