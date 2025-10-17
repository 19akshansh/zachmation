// http://localhost:3000/signup

import { SignupForm } from "@/features/auth/components/signupForm";
import { requireUnAuth } from "@/lib/authUtils";

const Page = async () => {
  await requireUnAuth();

  return (
    <div>
      <SignupForm />
    </div>
  );
};

export default Page;