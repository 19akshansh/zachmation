"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseTriggerNode } from "../baseTriggerNode";
import { StripeDialogTrigger } from "./dialog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";

import { Node } from "@xyflow/react";

type StripeTriggerNodeData = {
  status?: NodeStatus;
};

type StripeTriggerNodeType = Node<StripeTriggerNodeData>;

export const StripeTriggerNode = memo(
  (props: NodeProps<StripeTriggerNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenSettings = () => setDialogOpen(true);

    useNodeStatus({
      nodeId: props.id,
      channel: "stripeTriggerExec",
    });

    return (
      <>
        <StripeDialogTrigger open={dialogOpen} onOpenChange={setDialogOpen} />

        <BaseTriggerNode
          {...props}
          icon={"/stripe.svg"}
          name="Stripe"
          description="When stripe event is captured"
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
          status={props.data.status || "initial"}
        />
      </>
    );
  },
);

StripeTriggerNode.displayName = "StripeNode";
