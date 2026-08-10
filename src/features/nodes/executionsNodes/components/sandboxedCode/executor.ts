import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { envSchem } from "@/config/envSchema";
import { sandboxedCodeChannel } from "@/inngest/channels/executions/sandboxedCode";

export type SandboxedCodeData = {
  language?: "javascript" | "python";
  code?: string;
  variableName?: string;
};

type CodeServerResponse = {
  stdout: string;
  stderr: string;
  exit_code: number | null;
  timed_out: boolean;
  error: string | null;
};

const RESULT_MARKER = "__ZACHMATION_RESULT__";

const indentPython = (code: string) =>
  code
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");

const buildCode = (
  language: "javascript" | "python",
  code: string,
  context: Record<string, unknown[]>,
) => {
  const contextJson = JSON.stringify(context);

  if (language === "python") {
    return `import json\nimport sys\n\ncontext = json.loads(sys.stdin.read() or "{}")\n\ndef __zachmation_run():\n${indentPython(code)}\n\nresult = __zachmation_run()\nprint(${JSON.stringify(RESULT_MARKER)} + json.dumps(result, default=str))\n`;
  }

  return `const context = JSON.parse(${JSON.stringify(contextJson)});\nconst result = (() => {\n${code}\n})();\nprocess.stdout.write(${JSON.stringify(RESULT_MARKER)} + JSON.stringify(result === undefined ? null : result));\n`;
};

const extractResult = (stdout: string) => {
  const markerIndex = stdout.lastIndexOf(RESULT_MARKER);

  if (markerIndex === -1) {
    throw new Error("Code execution completed without returning a result.");
  }

  const rawResult = stdout.slice(markerIndex + RESULT_MARKER.length).trim();

  try {
    return JSON.parse(rawResult);
  } catch {
    throw new Error("Code execution returned an invalid JSON result.");
  }
};

export const SandboxedCodeExecutor: NodeExecutor<SandboxedCodeData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    sandboxedCodeChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  const language = data.language ?? "javascript";
  const code = data.code?.trim();
  const variableName = data.variableName?.trim();

  if (!code || !variableName) {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      sandboxedCodeChannel.status,
      {
        nodeId,
        status: "error",
        error: "Missing code or result variable.",
      },
    );
    throw new NonRetriableError("CODE: Missing code or result variable");
  }

  try {
    const result = await step.run(`sandboxed-code-${nodeId}`, async () => {
      const response = await fetch(`${envSchem.CODESERVER_API_URL}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": envSchem.CODESERVER_APIKEY,
        },
        body: JSON.stringify({
          language,
          code: buildCode(language, code, context),
          stdin: language === "javascript" ? "" : JSON.stringify(context),
        }),
        signal: AbortSignal.timeout(envSchem.CODESERVER_TIMEOUT_MS),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(
          `Code execution sandbox request failed with status ${response.status}: ${body}`,
        );
      }

      const payload = (await response.json()) as CodeServerResponse;

      if (payload.timed_out) {
        throw new Error("Code execution timed out.");
      }

      if (payload.error || payload.exit_code !== 0) {
        throw new Error(
          payload.error || payload.stderr || "Code execution failed.",
        );
      }

      return extractResult(payload.stdout ?? "");
    });

    await step.realtime.publish(
      `node-success-${nodeId}`,
      sandboxedCodeChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return {
      ...context,
      [variableName]: [result],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      sandboxedCodeChannel.status,
      {
        nodeId,
        status: "error",
        error: message,
      },
    );

    throw error;
  }
};
