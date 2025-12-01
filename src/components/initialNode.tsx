"use client";

import type { NodeProps } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";
import { PlaceholderNode } from "./reactFlow/placeholder-node";
import { WorkflowNode } from "./workflowNode";
import { NodeSelector } from "./nodeSelector";

export const InitialNode = memo((props: NodeProps) => {
  const [selectOpen, setSelectOpen] = useState(false);

  return (
    <NodeSelector open={selectOpen} onOpenChange={setSelectOpen}>
      <WorkflowNode showToolBar={false}>
        <PlaceholderNode {...props} onClick={() => setSelectOpen(true)}>
          <div className="cursor-pointer flex items-center justify-center">
            <PlusIcon className="size-4" />
          </div>
        </PlaceholderNode>
      </WorkflowNode>
    </NodeSelector>
  );
});

InitialNode.displayName = "InitialNode";
