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
  useImportWorkflow,
  useRemoveWorkflow,
  useSuspenseWorkflows,
  useWorkflowTags,
} from "../hooks/useWorkflows";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/useWorkflowsParams";
import { UseEntitySearch } from "@/hooks/useEnititySearch";
import type { Workflow as WorkflowType } from "@/generated/prisma/browser";
import {
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  UploadIcon,
  Share2Icon,
  WorkflowIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { RelativeTime } from "@/components/relativeTime";
import { toast } from "sonner";
import { useRef } from "react";

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
  const importWorkflow = useImportWorkflow();
  const router = useRouter();
  const { handleError, modal } = useUpgradeModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Workflow file must be smaller than 2 MB.");
      return;
    }

    try {
      const parsed = JSON.parse(
        await file.text(),
      ) as Parameters<typeof importWorkflow.mutate>[0];

      importWorkflow.mutate(parsed, {
        onSuccess: (data) => {
          router.push(`/workflows/${data.id}`);
        },
      });
    } catch {
      toast.error("Invalid workflow JSON file.");
    }
  };

  return (
    <>
      {modal}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImport}
      />
      <EntityHeader
        title="Workflows"
        description="Create and manage your Workflows"
        onNew={handleCreate}
        newButtonLabel="New Workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
        actions={
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || importWorkflow.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon className="size-4" />
            {importWorkflow.isPending ? "Importing..." : "Import"}
          </Button>
        }
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
  const { data: tags } = useWorkflowTags();

  const handleTagChange = (tag: string) => {
    setParams({
      ...params,
      tag: params.tag === tag ? "" : tag,
      page: 1,
    });
  };

  return (
    <div className="space-y-3">
      <EntitySearch
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search Workflows"
      />

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={!params.tag ? "secondary" : "outline"}
            onClick={() => setParams({ ...params, tag: "", page: 1 })}
          >
            All
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag}
              type="button"
              size="sm"
              variant={params.tag === tag ? "secondary" : "outline"}
              onClick={() => handleTagChange(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}
    </div>
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

export const WorkflowItem = ({
  data,
}: {
  data: WorkflowType & { tags: string[] };
}) => {
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

  const handleCopyPublicLink = async () => {
    if (!data.publicSlug) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/templates/${data.publicSlug}`,
      );
      toast.success("Public workflow link copied.");
    } catch {
      toast.error("Failed to copy public workflow link.");
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
        <div className="space-y-1">
          <div>
            Updated <RelativeTime date={data.updatedAt} /> &bull; Created{" "}
            <RelativeTime date={data.createdAt} />
          </div>
          <div className="flex flex-wrap gap-1">
            {data.publicSlug && (
              <Badge variant="outline" className="text-[10px]">
                Public
              </Badge>
            )}
            {data.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      menuActions={
        <>
          {data.publicSlug && (
            <>
              <DropdownMenuItem
                disabled={isBusy}
                onSelect={(event) => {
                  event.stopPropagation();
                  void handleCopyPublicLink();
                }}
              >
                <Share2Icon className="size-4" />
                Copy Public Link
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isBusy}
                onSelect={(event) => {
                  event.stopPropagation();
                  window.open(
                    `${window.location.origin}/templates/${data.publicSlug}`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                <ExternalLinkIcon className="size-4" />
                Open Public Page
              </DropdownMenuItem>
            </>
          )}
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
