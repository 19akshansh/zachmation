// http://localhost:3000/credentials/new

import { CredentialForm } from "@/features/credentials/components/credential";
import { requireAuth } from "@/lib/authUtils";

const Page = async () => {
  await requireAuth();

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto mx-w-screen-md w-full flex flex-col gap-y-8 h-full">
        <CredentialForm />
      </div>
    </div>
  );
};

export default Page;
