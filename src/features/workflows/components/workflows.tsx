"use client";

import {
  EntityHeader,
  EntityContainer,
  EntitySearch,
  EntityPagination,
  LoadingView,
  ErrorView,
  EmptyView,
  SearchEmptyView,
  EntityList,
  EntityItem,
} from "@/components/entityComponents";
import {
  useCreateWorkflow,
  useDuplicateWorkflow,
  useExportWorkflow,
  useRemoveWorkflow,
  useSuspenseWorkflows,
} from "../hooks/useWorkflows";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/useWorkflowsParams";
import { UseEntitySearch } from "@/hooks/useEnititySearch";
import type { Workflow as WorkflowType } from "@/generated/prisma/browser";
import { CopyIcon, DownloadIcon, WorkflowIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { RelativeTime } from "@/components/relativeTime";
import { toast } from "sonner";

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();
  const [params, setParams] = useWorkflowsParams();
  const query = params.search.trim();

  const clearSearch = () => {
    setParams({
      ...params,
      search: "",
      page: 1,
    });
  };

  return (
    <EntityList
      items={workflows.data.items}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItem data={workflow} />}
      emptyView={
        query ? (
          <SearchEmptyView
            query={query}
            entity="Workflows"
            onClear={clearSearch}
          />
        ) : (
          <WorkflowsEmpty />
        )
      }
    />
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const createWorkflow = useCreateWorkflow();
  const router = useRouter();
  const { handleError, modal } = useUpgradeModal();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage your Workflows"
        onNew={handleCreate}
        newButtonLabel="New Workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
      />
    </>
  );
};

export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowsParams();
  const { searchValue, onSearchChange } = UseEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search Workflows"
    />
  );
};

export const WorkflowsPagination = () => {
  const workflows = useSuspenseWorkflows();
  const [params, setParams] = useWorkflowsParams();

  return (
    <EntityPagination
      disabled={workflows.isFetching}
      totalPages={workflows.data.totalPages}
      page={workflows.data.page}
      onPageChange={(page) =>
        setParams({
          ...params,
          page,
        })
      }
    />
  );
};

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<WorkflowsSearch />}
      pagination={<WorkflowsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const WorkflowsLoading = () => {
  return <LoadingView message="Loading Workflows..." />;
};

export const WorkflowsError = () => {
  return <ErrorView message="Error Loading Workflows..." />;
};

export const WorkflowsEmpty = () => {
  const createWorkflow = useCreateWorkflow();
  const router = useRouter();
  const { handleError, modal } = useUpgradeModal();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  return (
    <>
      <EmptyView
        onNew={handleCreate}
        entity="Workflow"
        msg={<>No workflows Found :(</>}
      />
    </>
  );
};

export const WorkflowItem = ({ data }: { data: WorkflowType }) => {
  const removeWorkflow = useRemoveWorkflow();
  const duplicateWorkflow = useDuplicateWorkflow();
  const exportWorkflow = useExportWorkflow();

  const handleRemove = () => {
    removeWorkflow.mutate({
      id: data.id,
    });
  };

  const handleDuplicate = () => {
    duplicateWorkflow.mutate({ workflowId: data.id });
  };

  const handleExport = async () => {
    try {
      const result = await exportWorkflow.mutateAsync({ workflowId: data.id });

      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${data.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "workflow"}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(
        `Failed to export Workflow: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  const isBusy =
    removeWorkflow.isPending ||
    duplicateWorkflow.isPending ||
    exportWorkflow.isPending;

  return (
    <EntityItem
      href={`/workflows/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated <RelativeTime date={data.updatedAt} /> &bull; Created{" "}
          <RelativeTime date={data.createdAt} />
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      menuActions={
        <>
          <DropdownMenuItem
            disabled={isBusy}
            onSelect={(event) => {
              event.stopPropagation();
              handleDuplicate();
            }}
          >
            <CopyIcon className="size-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isBusy}
            onSelect={(event) => {
              event.stopPropagation();
              void handleExport();
            }}
          >
            <DownloadIcon className="size-4" />
            Export
          </DropdownMenuItem>
        </>
      }
      onRemove={handleRemove}
      isRemoving={removeWorkflow.isPending}
    />
  );
};
