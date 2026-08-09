"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import type { ReactNode } from "react";
import { Button } from "./ui/button";
import { PinIcon, PinOffIcon, SettingsIcon, TrashIcon } from "lucide-react";

interface WorkflowNodeProps {
  children: ReactNode;
  showToolBar?: boolean;
  onDelete?: () => void;
  onSettings?: () => void;
  name?: string;
  description?: string;
  pinned?: boolean;
  onPin?: () => void;
  pinDisabled?: boolean;
}

export function WorkflowNode({
  children,
  showToolBar = true,
  onDelete,
  onSettings,
  name,
  description,
  pinned = false,
  onPin,
  pinDisabled = false,
}: WorkflowNodeProps) {
  return (
    <>
      {showToolBar && (
        <NodeToolbar>
          <Button size={"sm"} variant={"ghost"} onClick={onSettings}>
            <SettingsIcon className="size-4" />
          </Button>
          {onPin && (
            <Button
              size="sm"
              variant={pinned ? "secondary" : "ghost"}
              onClick={onPin}
              disabled={pinDisabled}
              title={pinned ? "Unpin output" : "Pin latest output"}
            >
              {pinned ? (
                <PinOffIcon className="size-4" />
              ) : (
                <PinIcon className="size-4" />
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <TrashIcon className="size-4" />
          </Button>
        </NodeToolbar>
      )}
      {children}
      {name && (
        <NodeToolbar
          position={Position.Bottom}
          isVisible
          className="max-w-[200px] text-center"
        >
          <p className="font-medium">{name}</p>
          {description && (
            <p className="text-muted-foreground truncate text-sm">
              {description}
            </p>
          )}
        </NodeToolbar>
      )}
    </>
  );
}
