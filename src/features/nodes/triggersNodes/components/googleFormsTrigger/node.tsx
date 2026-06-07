"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseTriggerNode } from "../baseTriggerNode";
import { GoogleFormDialogTrigger } from "./dialog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";

import { Node } from "@xyflow/react";
import { CHANNELS } from "@/config/channels";

type GoogleFormNodeData = {
  status?: NodeStatus;
};

type GoogleFormNodeType = Node<GoogleFormNodeData>;

export const GoogleFormTriggerNode = memo(
  (props: NodeProps<GoogleFormNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenSettings = () => setDialogOpen(true);

    useNodeStatus({
      nodeId: props.id,
      channel: CHANNELS.GOOGLE_FORM_TRIGGER,
      topics: ["status"],
    });

    return (
      <>
        <GoogleFormDialogTrigger
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />

        <BaseTriggerNode
          {...props}
          icon={"/gforms.svg"}
          name="Google Form"
          description="When form is submitted"
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
          status={props.data.status || "initial"}
        />
      </>
    );
  },
);

GoogleFormTriggerNode.displayName = "GoogleFormNode";
