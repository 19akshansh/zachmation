"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GraduationCap } from "lucide-react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { ZachCourseDialog, ZachCourseFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type ZachCourseData = Partial<ZachCourseFormValues> & { status?: NodeStatus };
export type ZachCourseNodeType = Node<ZachCourseData>;

export const ZachCourseNode = (props: NodeProps<ZachCourseNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleSubmit = (values: ZachCourseFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.ZACHCOURSE,
    topics: ["status"],
  });

  return (
    <>
      <ZachCourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon={GraduationCap}
        name="ZachCourse"
        description={
          props.data.topic
            ? `Generate ${props.data.topic}`
            : "Generate a personalized course"
        }
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
      />
    </>
  );
};

ZachCourseNode.displayName = "ZachCourseNode";
