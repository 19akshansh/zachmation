import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/authUtils";

const Page = async () => {
  await requireAuth();
  redirect("/settings?tab=billing");
};

export default Page;
