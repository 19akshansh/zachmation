import LandingPage from "@/components/layout/individual/landingPage";
import { requireUnAuth } from "@/lib/authUtils";

export default async function Page() {
  await requireUnAuth();

  return <LandingPage />;
}
