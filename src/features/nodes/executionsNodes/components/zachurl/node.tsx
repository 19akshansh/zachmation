"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { LinkIcon } from "lucide-react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { ZachurlDialog, ZachurlFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

type ZachurlNodeData = Partial<ZachurlFormValues> & { status?: NodeStatus };
type ZachurlNodeType = Node<ZachurlNodeData>;

export const ZachurlNode = (props: NodeProps<ZachurlNodeType>) => {
  const [open, setOpen] = useState(false);
  const { setNodes } = useReactFlow();
  useNodeStatus({ nodeId: props.id, channel: CHANNELS.ZACHURL, topics: ["status"] });

  return (
    <>
      <ZachurlDialog
        open={open}
        onOpenChange={setOpen}
        defaultValues={props.data}
        onSubmit={(values) => setNodes((nodes) =>
          nodes.map((node) => node.id === props.id
            ? { ...node, data: { ...node.data, ...values } }
            : node)
        )}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon={LinkIcon}
        name="Zachurl"
        description="Create a short URL"
        onSettings={() => setOpen(true)}
        onDoubleClick={() => setOpen(true)}
      />
    </>
  );
};
ZachurlNode.displayName = "Zachurl Node";
