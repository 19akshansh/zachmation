// http://localhost:3000/
"use client"

import { Button } from "@/components/ui/button";
import { LogoutButton } from "./logout";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const text = useMutation(trpc.testAi.mutationOptions({
    onSuccess: () => {
      toast.success("AI Job Queued.")
    },
    onError: (error) => {
      toast.error(error.message)
    }
  }));

  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess: () => {
      toast.success("Job Queued.")
    },
    onError: (error) => {
      toast.error(error.message)
    }
  }));

  return (
    <div className="min-h-svh flex items-center justify-center flex-col gap-y-6 md:p-10 p-6">
      Protected
      <div>
        {JSON.stringify(data, null, 2)}
        {!data && <Loader2Icon color="#0f26bd" className="animate-spin size-8" />}
      </div>
      {data && (
        <>
          <Button disabled={text.isPending} onClick={() => text.mutate()}>
            Test AI
          </Button>
          <Button disabled={create.isPending} onClick={() => create.mutate()}>
            Create Workflow
          </Button>
        </>
      )}
      <LogoutButton />
    </div>
  );
};

export default Page;