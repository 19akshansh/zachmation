import { MousePointerIcon } from "lucide-react";
import { BaseTriggerNode } from "../triggerExecutionNode";
import { memo } from "react";
import { NodeProps } from "@xyflow/react";

export const ManualTriggerNode = memo((props: NodeProps) => {
  return (
    <>
      <BaseTriggerNode
        {...props}
        icon={MousePointerIcon}
        name="Execute workflow"
        // onSettings={handleOpenSettings}
        // onDoubleClick={handlOpenSettings} status={NodeStatus}
      />
    </>
  );
});
