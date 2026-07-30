"use client";

import React, { type ReactNode } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

import { BaseNode } from "@/components/reactFlow/base-node";

export type PlaceholderNodeProps = Partial<NodeProps> & {
  children?: ReactNode;
  onClick?: () => void;
};

export function PlaceholderNode({ children, onClick }: PlaceholderNodeProps) {
  return (
    <BaseNode
      className="w-auto h-auto border-dashed border-accent bg-card p-4 text-center text-primary shadow-none cursor-pointer hover:border-accent hover:border"
      onClick={onClick}
    >
      {children}
      <Handle
        type="target"
        style={{ visibility: "hidden" }}
        position={Position.Top}
        isConnectable={false}
      />
      <Handle
        type="source"
        style={{ visibility: "hidden" }}
        position={Position.Bottom}
        isConnectable={false}
      />
    </BaseNode>
  );
}
