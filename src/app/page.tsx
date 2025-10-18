// http://localhost:3000/

import { requireAuth } from "@/lib/authUtils";
import { caller } from "@/trpc/server";
import { LogoutButton } from "./logout";

const Page = async () => {
  await requireAuth();

  const data = await caller.getUsers();

  return (
    <div className="min-h-svh flex items-center justify-center flex-col gap-y-6 md:p-10 p-6">
      Protected
      <div>
        {JSON.stringify(data, null, 2)}
      </div>
      <LogoutButton />
    </div>
  );
};

export default Page;