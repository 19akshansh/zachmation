"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { MailIcon } from "lucide-react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { EmailSendDialog, EmailSendFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type EmailSendNodeData = EmailSendFormValues & {
  status?: NodeStatus;
};
export type EmailSendNodeType = Node<EmailSendNodeData>;

export const EmailSendNode = (props: NodeProps<EmailSendNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.EMAIL_SEND,
    topics: ["status"],
  });

  const handleSubmit = (values: EmailSendFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const recipient = props.data.to?.trim();
  const variableName = props.data.variableName?.trim();

  return (
    <>
      <EmailSendDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon={MailIcon}
        name="Email / SMTP"
        description={
          recipient
            ? `${recipient}${variableName ? ` → ${variableName}` : ""}`
            : "Send an email"
        }
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
      />
    </>
  );
};

EmailSendNode.displayName = "Email / SMTP Node";
