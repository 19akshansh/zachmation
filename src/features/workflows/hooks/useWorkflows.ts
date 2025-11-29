import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useWorkflowsParams } from "./useWorkflowsParams"
import { PAGINATION } from "@/config/constants";

export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  const [params] = useWorkflowsParams();

  const normalized = {
    page: params.page ?? PAGINATION.DEFAULT_PAGE,
    pageSize: params.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE,
    search: params.search ?? ""
  };

  return useSuspenseQuery(
    trpc.workflows.getMany.queryOptions(normalized)
  );
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" created!`)
        queryClient.invalidateQueries(
          trpc.workflows.getMany.queryOptions({})
        )
      },
      onError: (error) => {
        toast.error(`Failed to create Workflow: ${error.message}!`);
      }
    })
  )
}

export const useRemoveWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" removed!`)
        queryClient.invalidateQueries(
          trpc.workflows.getMany.queryOptions({})
        )
      },
      onError: (error) => {
        toast.error(`Failed to remove Workflow: ${error.message}!`);
      }
    })
  )
}