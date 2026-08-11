import { createId } from "@paralleldrive/cuid2";
import { NodeType } from "@/generated/prisma/enums";
import { getPublicExportFields } from "@/config/nodeTypes";

type WorkflowNode = {
  id: string;
  name: string;
  type: NodeType;
  position: unknown;
  data: unknown;
};

type WorkflowConnection = {
  fromNodeId: string;
  toNodeId: string;
  fromOutput: string;
  toInput: string;
};

type WorkflowForExport = {
  name: string;
  tags: string[];
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
};

const alwaysSensitiveKeys = new Set([
  "credentialid",
  "credential",
  "credentials",
  "apikey",
  "api_key",
  "clientsecret",
  "client_secret",
  "apisecret",
  "api_secret",
  "accesstoken",
  "access_token",
  "refreshtoken",
  "refresh_token",
  "privatekey",
  "private_key",
  "password",
  "secret",
  "secretkey",
  "secret_key",
  "authorization",
  "authtoken",
  "auth_token",
  "token",
  "bottoken",
  "bot_token",
  "webhookurl",
  "webhook_url",
]);

const sanitizeValue = (
  value: unknown,
  allowedFields: readonly string[],
  nested = false,
): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, allowedFields, true));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const allowed = new Set(allowedFields);

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, item]) => {
      const normalizedKey = key.toLowerCase();

      if (alwaysSensitiveKeys.has(normalizedKey)) {
        return [];
      }

      if (!nested && !allowed.has(key)) {
        return [];
      }

      return [[key, sanitizeValue(item, allowedFields, true)]];
    }),
  );
};

export const sanitizePublicNodeData = (
  type: NodeType,
  data: unknown,
): Record<string, unknown> => {
  const sanitized = sanitizeValue(data ?? {}, getPublicExportFields(type));

  if (!sanitized || typeof sanitized !== "object" || Array.isArray(sanitized)) {
    return {};
  }

  return sanitized as Record<string, unknown>;
};

export const buildPublicWorkflowExport = (workflow: WorkflowForExport) => {
  const idMap = new Map<string, string>();

  for (const node of workflow.nodes) {
    idMap.set(node.id, createId());
  }

  return {
    version: 1,
    name: workflow.name,
    tags: workflow.tags,
    nodes: workflow.nodes.map((node) => ({
      exportId: idMap.get(node.id)!,
      name: node.name,
      type: node.type,
      position: node.position,
      data: sanitizePublicNodeData(node.type, node.data),
    })),
    connections: workflow.connections.map((connection) => ({
      fromExportId: idMap.get(connection.fromNodeId)!,
      toExportId: idMap.get(connection.toNodeId)!,
      fromOutput: connection.fromOutput,
      toInput: connection.toInput,
    })),
  };
};
