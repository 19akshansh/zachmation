"use client";

import { ExecutionStatus } from "@/generated/prisma/browser";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import { useSuspenseExecution } from "../hooks/useExecutions";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-blue-600 animate-spin" />;
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-600" />;
    default:
      return <ClockIcon className="size-5 text-muted-foreground" />;
  }
};

const formatStatus = (status: ExecutionStatus) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

const CopyButton = ({
  value,
  section,
  copiedSection,
  onCopy,
}: {
  value: string;
  section: string;
  copiedSection: string | null;
  onCopy: (text: string, section: string) => void;
}) => {
  const copied = copiedSection === section;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => onCopy(value, section)}
    >
      {copied ? (
        <CheckIcon className="size-4" />
      ) : (
        <CopyIcon className="size-4" />
      )}
    </Button>
  );
};

export const ExecutionView = ({ executionId }: { executionId: string }) => {
  const { data: execution } = useSuspenseExecution(executionId);
  const [showStackTrace, setShowStackTrace] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const output = JSON.stringify(execution.output, null, 2);

  const duration = execution.completedAt
    ? Math.round(
        (new Date(execution.completedAt).getTime() -
          new Date(execution.startedAt).getTime()) /
          1000,
      )
    : null;

  const copyText = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedSection(section);
      toast.success("Copied to clipboard");

      setTimeout(() => {
        setCopiedSection(null);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy text");
    }
  };

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon(execution.status)}
          <div>
            <CardTitle>{formatStatus(execution.status)}</CardTitle>
            <CardDescription>
              Execution for {execution.workflow.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-">Workflow</p>
            <Link
              href={`/workflows/${execution.workflowId}`}
              prefetch
              className="text-sm hover:underline text-primary"
            >
              {execution.workflow.name}
            </Link>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-sm">{formatStatus(execution.status)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Started</p>
            <p className="text-sm">
              {formatDistanceToNow(execution.startedAt, {
                addSuffix: true,
              })}
            </p>
          </div>

          {execution.completedAt ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <p className="text-sm">
                {formatDistanceToNow(execution.completedAt, {
                  addSuffix: true,
                })}
              </p>
            </div>
          ) : null}

          {duration !== null ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Duration
              </p>
              <p className="text-sm">{duration}s</p>
            </div>
          ) : null}

          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Event ID
              </p>

              <CopyButton
                value={execution.inngestEventId}
                section="event-id"
                copiedSection={copiedSection}
                onCopy={copyText}
              />
            </div>

            <p className="text-sm break-all">{execution.inngestEventId}</p>
          </div>
        </div>

        {execution.error && (
          <div className="mt-6 p-4 bg-red-50 rounded-md space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-red-600">Error Log</p>

                <CopyButton
                  value={execution.error}
                  section="error"
                  copiedSection={copiedSection}
                  onCopy={copyText}
                />
              </div>

              <p className="text-sm text-red-800 font-mono">
                {execution.error}
              </p>
            </div>

            {execution.errorStack && (
              <Collapsible
                open={showStackTrace}
                onOpenChange={setShowStackTrace}
              >
                <CollapsibleTrigger>
                  <Button
                    variant={"ghost"}
                    size="sm"
                    className="text-red-900 hover:bg-red-100"
                  >
                    {showStackTrace ? "Hide Stack Trace" : "Show Stack Trace"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <CopyButton
                        value={execution.errorStack}
                        section="stack"
                        copiedSection={copiedSection}
                        onCopy={copyText}
                      />
                    </div>

                    <pre className="text-xs font-mono text-red-800 overflow-auto mt-2 p-2 pr-12 bg-red-100 rounded">
                      {execution.errorStack}
                    </pre>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        {execution.output && (
          <div className="relative mt-6 p-4 bg-muted rounded-md">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Output Log</p>

              <CopyButton
                value={output}
                section="output"
                copiedSection={copiedSection}
                onCopy={copyText}
              />
            </div>

            <pre className="text-xs font-mono overflow-auto">{output}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
