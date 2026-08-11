import { prisma } from "@/lib/db";
import { buildPublicWorkflowExport } from "@/features/workflows/lib/publicTemplate";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const workflow = await prisma.workflow.findUnique({
    where: { publicSlug: slug },
    include: {
      nodes: true,
      connections: true,
    },
  });

  if (!workflow) {
    return Response.json(
      { error: "Public workflow template not found." },
      { status: 404 },
    );
  }

  const exported = buildPublicWorkflowExport(workflow);
  const filename =
    `${workflow.name.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() || "workflow"}.json`;

  return new Response(JSON.stringify(exported, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
