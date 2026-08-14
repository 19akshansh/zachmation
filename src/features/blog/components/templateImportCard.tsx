"use client";

import { useState } from "react";
import { Check, Copy, Download, Workflow } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WorkflowTemplateExport } from "@/lib/blog";

type Props = {
  template: WorkflowTemplateExport;
  slug: string;
  className?: string;
};

export function TemplateImportCard({ template, slug, className }: Props) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(template, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    toast.success("Template JSON copied - paste it into Workflows → Import");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("border-primary/20 bg-primary/5 p-6 gap-4", className)}>
      <CardHeader className="p-0">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Workflow className="size-5" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-base">
              Ready-to-import workflow: {template.name}
            </CardTitle>
            <CardDescription>
              Copy the JSON and paste it into{" "}
              <span className="font-mono text-xs text-foreground">
                Workflows → Import
              </span>{" "}
              to load this template directly into your Zachmation account.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {template.tags?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check /> Copied
              </>
            ) : (
              <>
                <Copy /> Copy template JSON
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download /> Download .json
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
