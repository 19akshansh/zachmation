"use client";

import { Settings2Icon, ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useErrorWorkflows,
  useSetErrorWorkflow,
  useSuspenseWorkflow,
} from "@/features/workflows/hooks/useWorkflows";
import { useEffect, useState } from "react";

export const WorkflowSettingsDialog = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const [open, setOpen] = useState(false);
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const { data: workflows } = useErrorWorkflows();
  const setErrorWorkflow = useSetErrorWorkflow();
  const [errorWorkflowId, setErrorWorkflowId] = useState<string>(
    workflow.errorWorkflowId ?? "none",
  );

  useEffect(() => {
    if (open) {
      setErrorWorkflowId(workflow.errorWorkflowId ?? "none");
    }
  }, [open, workflow.errorWorkflowId]);

  const handleSave = async () => {
    try {
      await setErrorWorkflow.mutateAsync({
        id: workflowId,
        errorWorkflowId: errorWorkflowId === "none" ? null : errorWorkflowId,
      });
      setOpen(false);
    } catch {
      // Mutation hook displays the error toast.
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Settings2Icon className="size-4" />
        Settings
      </Button>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlertIcon className="size-5" />
            Workflow Settings
          </DialogTitle>
          <DialogDescription>
            Configure what should happen when this workflow fails.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-3">
            <p className="text-sm font-medium">On failure</p>
            <p className="text-xs text-muted-foreground">
              Automatically run another workflow when this workflow execution
              fails. The handler receives the failed workflow ID, error message,
              and execution ID under <code>errorContext</code>.
            </p>
          </div>

          <Select
            value={errorWorkflowId}
            onValueChange={setErrorWorkflowId}
            disabled={setErrorWorkflow.isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an error workflow" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No error workflow</SelectItem>
              {workflows
                .filter((candidate) => candidate.id !== workflowId)
                .map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={setErrorWorkflow.isPending}>
            {setErrorWorkflow.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
