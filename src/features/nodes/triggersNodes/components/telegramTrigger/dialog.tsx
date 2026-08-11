"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NodeType } from "@/generated/prisma/enums";
import { useCredentialsByNodeType } from "@/features/credentials/hooks/useCredentials";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  credentialId?: string;
  onRegistered: (credentialId: string) => void;
}

export const TelegramTriggerDialog = ({
  open,
  onOpenChange,
  nodeId,
  credentialId,
  onRegistered,
}: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;
  const [selectedCredentialId, setSelectedCredentialId] = useState(
    credentialId ?? "",
  );
  const { data: credentials = [], isLoading: credentialsLoading } =
    useCredentialsByNodeType(NodeType.TELEGRAM_TRIGGER);
  const trpc = useTRPC();

  const registerWebhook = useMutation(
    trpc.workflows.registerTelegramWebhook.mutationOptions({
      onSuccess: () => {
        onRegistered(selectedCredentialId);
        toast.success("Telegram webhook registered.");
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(`Failed to register Telegram webhook: ${error.message}`);
      },
    }),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Telegram Trigger Configuration</DialogTitle>
          <DialogDescription>
            Choose a Telegram bot credential, then register this workflow as the
            bot&apos;s webhook.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Telegram bot credential</Label>
            <Select
              value={selectedCredentialId}
              onValueChange={setSelectedCredentialId}
              disabled={credentialsLoading || !credentials.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Telegram bot" />
              </SelectTrigger>
              <SelectContent>
                {credentials.map((credential) => (
                  <SelectItem key={credential.id} value={credential.id}>
                    {credential.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!credentialsLoading && credentials.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Create a TELEGRAM_BOT credential first.
              </p>
            )}
          </div>

          <Button
            className="w-full"
            disabled={
              credentialsLoading ||
              !credentials.length ||
              !selectedCredentialId ||
              registerWebhook.isPending
            }
            onClick={() =>
              registerWebhook.mutate({
                workflowId,
                nodeId,
                credentialId: selectedCredentialId,
              })
            }
          >
            {registerWebhook.isPending && (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            )}
            Register webhook
          </Button>

          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Incoming updates are available under{" "}
            <code className="rounded bg-background px-1 py-0.5">
              {"{{telegram.[0]}}"}
            </code>
            .
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
