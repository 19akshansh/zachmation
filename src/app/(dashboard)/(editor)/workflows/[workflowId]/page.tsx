// http://localhost:3000/workflows/3000

import { requireAuth } from "@/lib/authUtils";

interface PageProps {
  params: Promise<{
    workflowId: string;
  }>
}

const Page = async ({
  params
}: PageProps) => {
  await requireAuth();
  const { workflowId } = await params;

  return (
    <p>Workflows ID: {workflowId} </p>
  );
};

export default Page;