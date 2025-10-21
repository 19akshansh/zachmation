// http://localhost:3000/credentials

import { requireAuth } from "@/lib/authUtils";

const Page = async () => {
  await requireAuth();

  return (
    <p>Credentials Page</p>
  );
};

export default Page;