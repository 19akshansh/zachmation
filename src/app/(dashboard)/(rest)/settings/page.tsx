import { Suspense } from "react";
import { Settings } from "@/features/settings/components/settings";
import { requireAuth } from "@/lib/authUtils";

const Page = async () => {
  await requireAuth();

  return (
    <Suspense>
      <Settings />
    </Suspense>
  );
};

export default Page;
