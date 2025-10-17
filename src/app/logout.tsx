"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/authClient";
import { useRouter } from "next/navigation";

export const LogoutButton = () => {
  const router = useRouter();
  return <Button onClick={() => authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/signin");
      },
    },
  })}>
    Logout
  </Button>
}