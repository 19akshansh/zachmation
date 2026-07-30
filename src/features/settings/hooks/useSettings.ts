"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/authClient";
import { useTRPC } from "@/trpc/client";

export const useDeleteAccount = () => {
  const trpc = useTRPC();
  const router = useRouter();

  return useMutation(
    trpc.settings.deleteAccount.mutationOptions({
      onSuccess: async () => {
        await authClient.signOut();
        toast.success("Your account has been deleted.");
        router.replace("/");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete account. Please try again.");
      },
    }),
  );
};
