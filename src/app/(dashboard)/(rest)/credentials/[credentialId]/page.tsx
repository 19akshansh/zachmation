// http://localhost:3000/credentials/3000

import { requireAuth } from "@/lib/authUtils";

interface PageProps {
  params: Promise<{
    credentialId: string;
  }>
}

const Page = async ({
  params
}: PageProps) => {
  await requireAuth();
  const { credentialId } = await params;

  return (
    <p>Credentials ID: {credentialId} </p>
  );
};

export default Page;