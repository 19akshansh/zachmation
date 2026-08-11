import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/db";
import { DownloadIcon, WorkflowIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PublicWorkflowTemplatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const workflow = await prisma.workflow.findUnique({
    where: { publicSlug: slug },
    select: {
      name: true,
      tags: true,
      nodes: {
        select: {
          type: true,
        },
      },
    },
  });

  if (!workflow) {
    notFound();
  }

  const nodeTypes = [...new Set(workflow.nodes.map((node) => node.type))];

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Zachmation Workflow Template
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {workflow.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Import this workflow into Zachmation and configure your own
            credentials.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WorkflowIcon className="size-5" />
              Workflow template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {workflow.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {workflow.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border bg-muted px-2 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Included nodes</p>
              <div className="flex flex-wrap gap-2">
                {nodeTypes.map((type) => (
                  <span
                    key={type}
                    className="rounded-md border px-2 py-1 text-xs text-muted-foreground"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              Credentials and known secret fields are stripped from the
              downloaded template. You will need to configure your own
              credentials after importing it.
            </div>

            <Button asChild className="w-full">
              <Link href={`/api/workflows/public/${slug}`}>
                <DownloadIcon className="size-4" />
                Download Workflow JSON
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
