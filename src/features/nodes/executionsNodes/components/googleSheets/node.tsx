"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { FileSpreadsheetIcon } from "lucide-react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { GoogleSheetsDialog, GoogleSheetsFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type GoogleSheetsNodeData = GoogleSheetsFormValues & {
  status?: NodeStatus;
};
export type GoogleSheetsNodeType = Node<GoogleSheetsNodeData>;

export const GoogleSheetsNode = (props: NodeProps<GoogleSheetsNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.GOOGLE_SHEETS,
    topics: ["status"],
  });

  const handleSubmit = (values: GoogleSheetsFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const variableName = props.data.variableName?.trim();

  return (
    <>
      <GoogleSheetsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon={"/googleSheets.svg"}
        name="Google Sheets"
        description={
          variableName
            ? `${props.data.operation === "append" ? "Append" : "Read"} → ${variableName}`
            : "Read or append rows"
        }
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
      />
    </>
  );
};

GoogleSheetsNode.displayName = "Google Sheets Node";
