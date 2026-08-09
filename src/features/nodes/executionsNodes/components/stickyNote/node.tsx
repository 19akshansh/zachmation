"use client";

import { NodeResizer, type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { StickyNoteIcon } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type StickyNoteData = {
  text?: string;
  color?: string;
  width?: number;
  height?: number;
};

export type StickyNoteNodeType = Node<StickyNoteData>;

export const StickyNoteNode = (props: NodeProps<StickyNoteNodeType>) => {
  const { setNodes } = useReactFlow();
  const [text, setText] = useState(props.data.text ?? "");
  const [isEditing, setIsEditing] = useState(false);

  const updateData = (updates: Partial<StickyNoteData>) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...updates } }
          : node,
      ),
    );
  };

  const width = props.data.width ?? 260;
  const height = props.data.height ?? 180;

  return (
    <div
      className="relative h-full w-full"
      style={{ width, height }}
      onDoubleClick={() => setIsEditing(true)}
    >
      <NodeResizer
        minWidth={180}
        minHeight={120}
        onResizeEnd={(_, params) => {
          updateData({
            width: Math.round(params.width),
            height: Math.round(params.height),
          });
        }}
      />

      <div
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-lg border shadow-sm",
          "border-amber-300/70 bg-amber-100/90 dark:border-amber-400/30 dark:bg-amber-200/10",
        )}
      >
        <div className="flex h-9 shrink-0 items-center gap-2 border-b border-amber-300/60 px-3 dark:border-amber-400/20">
          <StickyNoteIcon className="size-4 text-amber-600 dark:text-amber-300" />
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
            Sticky Note
          </span>
        </div>

        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={() => {
            setIsEditing(false);
            updateData({ text });
          }}
          placeholder="Write a note..."
          className="min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent p-3 text-sm shadow-none focus-visible:ring-0"
        />

        {!isEditing && !text && (
          <span className="pointer-events-none absolute bottom-3 left-3 text-xs text-amber-700/60 dark:text-amber-200/50">
            Double-click to edit
          </span>
        )}
      </div>
    </div>
  );
};

StickyNoteNode.displayName = "Sticky Note Node";
