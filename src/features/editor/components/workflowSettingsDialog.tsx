"use client";

import { Settings2Icon, ShieldAlertIcon, PowerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useSetWorkflowActive,
  useSetWorkflowTags,
  useSuspenseWorkflow,
} from "@/features/workflows/hooks/useWorkflows";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

export const WorkflowSettingsDialog = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const [open, setOpen] = useState(false);
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const { data: workflows } = useErrorWorkflows();
  const workflowTags =
    (workflow as typeof workflow & { tags: string[] }).tags ?? [];
  const workflowTagsValue = workflowTags.join(", ");
  const setErrorWorkflow = useSetErrorWorkflow();
  const setWorkflowActive = useSetWorkflowActive();
  const setWorkflowTags = useSetWorkflowTags();
  const [errorWorkflowId, setErrorWorkflowId] = useState<string>(
    workflow.errorWorkflowId ?? "none",
  );
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (open) {
      setErrorWorkflowId(workflow.errorWorkflowId ?? "none");
      setTags(workflowTagsValue);
    }
  }, [open, workflow.errorWorkflowId, workflowTagsValue]);

  const handleSave = async () => {
    try {
      const parsedTags = [
        ...new Set(
          tags
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean),
        ),
      ];

      await setErrorWorkflow.mutateAsync({
        id: workflowId,
        errorWorkflowId: errorWorkflowId === "none" ? null : errorWorkflowId,
      });

      await setWorkflowTags.mutateAsync({
        id: workflowId,
        tags: parsedTags,
      });

      setOpen(false);
    } catch {
      // Mutation hooks display the error toast.
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
            Control whether this workflow can run and what should happen when it
            fails.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium">
                <PowerIcon className="size-4" />
                Workflow status
              </p>
              <p className="text-xs text-muted-foreground">
                Deactivate this workflow to stop trigger events from starting
                new executions.
              </p>
            </div>
            <Switch
              checked={workflow.isActive}
              disabled={setWorkflowActive.isPending}
              onCheckedChange={(isActive) =>
                setWorkflowActive.mutate({ id: workflowId, isActive })
              }
              aria-label={
                workflow.isActive ? "Deactivate workflow" : "Activate workflow"
              }
            />
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-3">
            <p className="text-sm font-medium">Tags</p>
            <p className="text-xs text-muted-foreground">
              Add comma-separated tags to organize and filter your workflows.
            </p>
          </div>
          <Input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="e.g. discord, reporting, production"
            disabled={setWorkflowTags.isPending}
          />
        </div>

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
          <Button
            onClick={handleSave}
            disabled={setErrorWorkflow.isPending || setWorkflowTags.isPending}
          >
            {setErrorWorkflow.isPending || setWorkflowTags.isPending
              ? "Saving..."
              : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
