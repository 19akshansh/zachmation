"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";
import { BaseTriggerNode } from "../baseTriggerNode";
import { ManualTriggerDialog } from "./dialog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";

import { Node } from "@xyflow/react";

type ManualTriggerNodeData = {
  status?: NodeStatus;
};

type ManualTriggerNodeType = Node<ManualTriggerNodeData>;

export const ManualTriggerNode = memo(
  (props: NodeProps<ManualTriggerNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenSettings = () => setDialogOpen(true);

    useNodeStatus({
      nodeId: props.id,
      channel: "manualTriggerExec",
    });

    return (
      <>
        <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />

        <BaseTriggerNode
          {...props}
          icon={MousePointerIcon}
          name="Execute workflow"
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
          status={props.data.status || "initial"}
        />
      </>
    );
  },
);

ManualTriggerNode.displayName = "ManualTriggerNode";
