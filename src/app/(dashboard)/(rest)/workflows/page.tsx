// http://localhost:3000/workflows

import { requireAuth } from "@/lib/authUtils";

const Page = async () => {
  await requireAuth();

  return (
    <p>Workflow Page</p>
  );
};

export default Page;