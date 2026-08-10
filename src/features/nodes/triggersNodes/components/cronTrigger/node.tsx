"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { TimerIcon } from "lucide-react";
import { BaseTriggerNode } from "../baseTriggerNode";
import { CronTriggerDialog, CronTriggerFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { CHANNELS } from "@/config/channels";

type CronTriggerNodeData = CronTriggerFormValues & {
  status?: NodeStatus;
};

type CronTriggerNodeType = Node<CronTriggerNodeData>;

export const CronTriggerNode = memo((props: NodeProps<CronTriggerNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes, setEdges } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.CRON_TRIGGER,
    topics: ["status"],
  });

  const handleSubmit = (values: CronTriggerFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== props.id));
    setEdges((edges) =>
      edges.filter(
        (edge) => edge.source !== props.id && edge.target !== props.id,
      ),
    );
  };

  const cronExpression = props.data.cronExpression || "0 * * * *";

  return (
    <>
      <CronTriggerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <BaseTriggerNode
        {...props}
        icon={TimerIcon}
        name="Schedule"
        description={cronExpression}
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
        status={props.data.status || "initial"}
      />
    </>
  );
});

CronTriggerNode.displayName = "CronTriggerNode";
