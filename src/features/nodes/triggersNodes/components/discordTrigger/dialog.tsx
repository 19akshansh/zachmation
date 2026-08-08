"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publicKey?: string;
  onSubmit: (publicKey: string) => void;
}

export const DiscordTriggerDialog = ({
  open,
  onOpenChange,
  publicKey,
  onSubmit,
}: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;
  const [value, setValue] = useState(publicKey ?? "");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const endpoint = `${baseUrl}/api/webhooks/discord?workflowId=${workflowId}`;

  const save = () => {
    const normalized = value.trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(normalized)) {
      toast.error("Discord public key must be 64 hexadecimal characters.");
      return;
    }
    onSubmit(normalized);
    onOpenChange(false);
    toast.success("Discord trigger configured. Save the workflow before verification.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Discord Trigger Configuration</DialogTitle>
          <DialogDescription>
            Paste your application public key, save the workflow, then use the
            endpoint below as the Interactions Endpoint URL in Discord.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="discord-public-key">Application public key</Label>
            <Input
              id="discord-public-key"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Discord Developer Portal public key"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label>Interactions Endpoint URL</Label>
            <div className="break-all rounded-lg bg-muted p-3 font-mono text-xs">
              {endpoint}
            </div>
          </div>

          <Button className="w-full" onClick={save} disabled={!value.trim()}>
            Save configuration
          </Button>

          <p className="text-sm text-muted-foreground">
            Verified interaction payloads are available under {" "}
            <code className="rounded bg-muted px-1 py-0.5">{"{{discord.[0]}}"}</code>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
