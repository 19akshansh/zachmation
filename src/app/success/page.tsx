import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div>
      <p>
        Payments coming soon, you can still use the app and no money will be
        deducted from your account.
      </p>

      <Button asChild>
        <Link href="/workflows" prefetch>
          Enter Zachmation
        </Link>
      </Button>
    </div>
  );
}
