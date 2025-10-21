// http://localhost:3000/executions/3000

import { requireAuth } from "@/lib/authUtils";

interface PageProps {
  params: Promise<{
    executionId: string;
  }>
}

const Page = async ({
  params
}: PageProps) => {
  await requireAuth();
  const { executionId } = await params;

  return (
    <p>Executions ID: {executionId} </p>
  );
};

export default Page;