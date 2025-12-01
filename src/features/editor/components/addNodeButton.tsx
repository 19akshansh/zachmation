"use client";

import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { NodeSelector } from "@/components/nodeSelector";

export const AddNodeButton = memo(() => {
  const [selectOpen, setSelectOpen] = useState(false);

  return (
    <NodeSelector open={selectOpen} onOpenChange={setSelectOpen}>
      <Button
        onClick={() => setSelectOpen(true)}
        size={"icon"}
        variant={"outline"}
        className="bg-background"
      >
        <PlusIcon className="text-white" />
      </Button>
    </NodeSelector>
  );
});

AddNodeButton.displayName = "AddNodeButton";
