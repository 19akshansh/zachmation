import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { decrypt, encrypt } from "@/lib/encryption";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { googleSheetsChannel } from "@/inngest/channels/executions/googleSheets";
import { envSchem } from "@/config/envSchema";

type GoogleSheetsData = {
  variableName?: string;
  credentialId?: string;
  operation?: "read" | "append";
  spreadsheetId?: string;
  range?: string;
  rowValues?: string;
};

type GoogleOAuthCredential = {
  provider?: "google";
  access_token?: string;
  refresh_token?: string;
  expiry_date?: number;
  scope?: string;
  token_type?: string;
};

const refreshGoogleAccessToken = async (credential: GoogleOAuthCredential) => {
  if (!credential.refresh_token) {
    throw new NonRetriableError(
      "GOOGLE_SHEETS: Google account is not connected. Reconnect the credential.",
    );
  }

  if (
    credential.access_token &&
    credential.expiry_date &&
    credential.expiry_date > Date.now() + 60_000
  ) {
    return credential;
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: envSchem.GOOGLE_CLIENT_ID,
      client_secret: envSchem.GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: credential.refresh_token,
    }),
  });

  const tokens = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !tokens.access_token) {
    throw new NonRetriableError(
      `GOOGLE_SHEETS: Failed to refresh Google access token: ${tokens.error_description || tokens.error || "Unknown error"}`,
    );
  }

  return {
    ...credential,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || credential.refresh_token,
    expiry_date: Date.now() + (tokens.expires_in ?? 3600) * 1000,
    scope: tokens.scope || credential.scope,
    token_type: tokens.token_type || credential.token_type,
  };
};

export const GoogleSheetsExecutor: NodeExecutor<GoogleSheetsData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    googleSheetsChannel.status,
    { nodeId, status: "loading" },
  );

  if (
    !data.credentialId ||
    !data.operation ||
    !data.spreadsheetId ||
    !data.range ||
    !data.variableName
  ) {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      googleSheetsChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError(
      "GOOGLE_SHEETS: Missing credential, operation, spreadsheet ID, range, or variable name",
    );
  }

  const credentialId = data.credentialId;
  const operation = data.operation;
  const spreadsheetIdTemplate = data.spreadsheetId;
  const rangeTemplate = data.range;
  const variableName = data.variableName;
  const rowValuesTemplate = data.rowValues;

  try {
    const result = await step.run(`google-sheets-${nodeId}`, async () => {
      const credential = await prisma.credential.findFirst({
        where: { id: credentialId, userId, type: "GOOGLE_SHEETS" },
      });

      if (!credential) {
        throw new NonRetriableError(
          "GOOGLE_SHEETS: Credential not found or not owned by this user",
        );
      }

      let oauthCredential: GoogleOAuthCredential;
      try {
        oauthCredential = JSON.parse(
          decrypt(credential.value),
        ) as GoogleOAuthCredential;
      } catch {
        throw new NonRetriableError(
          "GOOGLE_SHEETS: Invalid Google OAuth credential",
        );
      }

      const refreshedCredential =
        await refreshGoogleAccessToken(oauthCredential);

      if (
        refreshedCredential.access_token !== oauthCredential.access_token ||
        refreshedCredential.expiry_date !== oauthCredential.expiry_date
      ) {
        await prisma.credential.update({
          where: { id: credential.id },
          data: { value: encrypt(JSON.stringify(refreshedCredential)) },
        });
      }

      const spreadsheetId = Handlebars.compile(spreadsheetIdTemplate)(context);
      const range = Handlebars.compile(rangeTemplate)(context);
      const encodedRange = encodeURIComponent(range);
      const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values`;
      const headers = {
        Authorization: `Bearer ${refreshedCredential.access_token}`,
        "Content-Type": "application/json",
      };

      if (operation === "read") {
        const response = await fetch(`${baseUrl}/${encodedRange}`, { headers });
        const payload = (await response.json()) as {
          values?: unknown[][];
          error?: { message?: string };
        };

        if (!response.ok) {
          throw new Error(
            payload.error?.message ||
              `Google Sheets read failed (${response.status})`,
          );
        }

        return { ...context, [variableName]: payload.values ?? [] };
      }

      if (!rowValuesTemplate?.trim()) {
        throw new NonRetriableError(
          "GOOGLE_SHEETS (append): Row values are required",
        );
      }

      const resolvedRow = rowValuesTemplate
        .split(",")
        .map((template) => Handlebars.compile(template.trim())(context));

      const response = await fetch(
        `${baseUrl}/${encodedRange}:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ values: [resolvedRow] }),
        },
      );
      const payload = (await response.json()) as {
        updates?: {
          updatedRange?: string | null;
          updatedRows?: number | null;
          updatedColumns?: number | null;
        };
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new Error(
          payload.error?.message ||
            `Google Sheets append failed (${response.status})`,
        );
      }

      return {
        ...context,
        [variableName]: [
          {
            appended: resolvedRow,
            updatedRange: payload.updates?.updatedRange ?? null,
            updatedRows: payload.updates?.updatedRows ?? 0,
            updatedColumns: payload.updates?.updatedColumns ?? 0,
          },
        ],
      };
    });

    await step.realtime.publish(
      `node-success-${nodeId}`,
      googleSheetsChannel.status,
      { nodeId, status: "success" },
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      googleSheetsChannel.status,
      { nodeId, status: "error", error: message },
    );
    throw error;
  }
};
