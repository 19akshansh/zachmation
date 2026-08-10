"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { CalendarClockIcon } from "lucide-react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { DateTimeDialog, DateTimeFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type DateTimeNodeData = DateTimeFormValues & {
  status?: NodeStatus;
};
export type DateTimeNodeType = Node<DateTimeNodeData>;

export const DateTimeNode = (props: NodeProps<DateTimeNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.DATE_TIME,
    topics: ["status"],
  });

  const handleSubmit = (values: DateTimeFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const sourceKey = props.data.sourceKey?.trim();
  const variableName = props.data.variableName?.trim();

  const operationLabel =
    props.data.operation === "format"
      ? `Format${props.data.formatPattern ? `: ${props.data.formatPattern}` : ""}`
      : props.data.operation === "addDays"
        ? `+${props.data.amount ?? 0}d`
        : props.data.operation === "addHours"
          ? `+${props.data.amount ?? 0}h`
          : props.data.operation === "addMinutes"
            ? `+${props.data.amount ?? 0}m`
            : props.data.operation === "subtractDays"
              ? `-${props.data.amount ?? 0}d`
              : props.data.operation === "subtractHours"
                ? `-${props.data.amount ?? 0}h`
                : props.data.operation === "subtractMinutes"
                  ? `-${props.data.amount ?? 0}m`
                  : "Format or shift";

  return (
    <>
      <DateTimeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon={CalendarClockIcon}
        name="Date & Time"
        description={
          sourceKey
            ? `${operationLabel}: ${sourceKey}${variableName ? ` → ${variableName}` : ""}`
            : "Format or shift dates"
        }
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
      />
    </>
  );
};

DateTimeNode.displayName = "Date & Time Node";
