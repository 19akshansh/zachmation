// http://localhost:3000/signin

import { SigninForm } from "@/features/auth/components/signinForm";
import { requireUnAuth } from "@/lib/authUtils";

const Page = async () => {
  await requireUnAuth();

  return (
    <div>
      <SigninForm />
    </div>
  );
};

export default Page;