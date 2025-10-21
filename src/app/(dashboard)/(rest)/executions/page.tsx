// http://localhost:3000/executions

import { requireAuth } from "@/lib/authUtils";

const Page = async () => {
  await requireAuth();

  return (
    <p>Executions Page</p>
  );
};

export default Page;