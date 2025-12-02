"use client";

import type { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";

type HttpReqNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  [key: string]: unknown;
};

type HttpReqNodeType = Node<HttpReqNodeData>;

export const HttpReqNode = memo((props: NodeProps<HttpReqNodeType>) => {
  const nodeData = props.data as HttpReqNodeData;
  const desc = nodeData?.endpoint
    ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
    : "Not configured";

  const nodeStatus = "initial";

  return (
    <>
      <BaseExecutionNode
        {...props}
        id={props.id}
        status={nodeStatus}
        icon={GlobeIcon}
        name="HTTP Request"
        description={desc}
        onSettings={() => {}}
        onDoubleClick={() => {}}
      />
    </>
  );
});

HttpReqNode.displayName = "HttpReqNode";
