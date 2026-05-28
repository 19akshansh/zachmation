"use client";

import {
  EntityHeader,
  EntityContainer,
  EntitySearch,
  EntityPagination,
  LoadingView,
  ErrorView,
  EmptyView,
  EntityList,
  EntityItem,
} from "@/components/entityComponents";
import {
  useCreateCredential,
  useRemoveCredential,
  useSuspenseCredential,
  useSuspenseCredentials,
} from "../hooks/useCredentials";
import { useRouter } from "next/navigation";
import { useCredentialsParams } from "../hooks/useCredentialsParams";
import { UseEntitySearch } from "@/hooks/useEnititySearch";
import { CredentialType, type Credential } from "@/generated/prisma/browser";
import { RelativeTime } from "@/components/relativeTime";
import Image from "next/image";
import { CredentialForm } from "./credential";

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.data.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialItem data={credential} />}
      emptyView={<CredentialsEmpty />}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <>
      <EntityHeader
        title="Credentials"
        description="Create and manage your Credentials"
        newButtonLabel="New Credential"
        disabled={disabled}
        newButtonHref={"/credentials/new"}
      />
    </>
  );
};

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = UseEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search Credentials"
    />
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();

  return (
    <EntityPagination
      disabled={credentials.isFetching}
      totalPages={credentials.data.totalPages}
      page={credentials.data.page}
      onPageChange={(page) =>
        setParams({
          ...params,
          page,
        })
      }
    />
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const CredentialsLoading = () => {
  return <LoadingView message="Loading Credentials..." />;
};

export const CredentialsError = () => {
  return <ErrorView message="Error Loading Credentials..." />;
};

export const CredentialsEmpty = () => {
  const router = useRouter();
  const handleCreate = () => {
    router.push(`/credentials/new`);
  };

  return (
    <>
      <EmptyView
        onNew={handleCreate}
        entity="Credentials"
        msg={<>No credentials Found :(</>}
      />
    </>
  );
};

const credentialLogos: Record<string, string> = {
  [CredentialType.OPENAI]: "/openai.svg",
  [CredentialType.GEMINI]: "/gemini.svg",
  [CredentialType.ANTHROPIC]: "/anthropic.svg",
};

export const CredentialItem = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredential();

  const handleRemove = () => {
    removeCredential.mutate({
      id: data.id,
    });
  };

  const logo = credentialLogos[data.type] || "/openai.svg";

  return (
    <EntityItem
      href={`/credentials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated <RelativeTime date={data.updatedAt} />
          &bull; Created <RelativeTime date={data.createdAt} />
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <Image src={logo} alt={data.type} width={24} height={24} />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
};

export const CredentialView = ({
  credentialId,
}: {
  credentialId: string;
}) => {
  const { data: credential } = useSuspenseCredential(credentialId);

  return <CredentialForm initialData={credential} />;
};
