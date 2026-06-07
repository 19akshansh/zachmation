import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { NonRetriableError } from "inngest";
import { InferenceClient } from "@huggingface/inference";
import { blackForestChannel } from "@/inngest/channels/ai/blackforest";
import { BlackForestModelId } from "@/config/ai/blackforestModels";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(stringified);
});

type BlackForestData = {
  variableName?: string;
  credentialId?: string;
  imgbbCredentialId?: string; 
  model?: BlackForestModelId;
  prompt?: string;
};

export const BlackForestExecutor: NodeExecutor<BlackForestData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    blackForestChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  if (!data.variableName) {
    await step.realtime.publish(
      `node-error-variable-${nodeId}`,
      blackForestChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError("BLACK_FOREST: No variable name configured");
  }

  if (!data.prompt) {
    await step.realtime.publish(
      `node-error-prompt-${nodeId}`,
      blackForestChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError("BLACK_FOREST: No Prompt configured");
  }

  if (!data.credentialId) {
    await step.realtime.publish(
      `node-error-credential-${nodeId}`,
      blackForestChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError(
      "BLACK_FOREST: No Hugging Face Credential configured",
    );
  }

  if (!data.imgbbCredentialId) {
    await step.realtime.publish(
      `node-error-imgbb-credential-${nodeId}`,
      blackForestChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError("BLACK_FOREST: No ImgBB Credential configured");
  }

  const prompt = Handlebars.compile(data.prompt)(context);

  const { hfCredential, imgbbCredential } = await step.run(
    `node-get-credentials-${nodeId}`,
    async () => {
      const [hf, ibb] = await Promise.all([
        prisma.credential.findUnique({
          where: { id: data.credentialId, userId },
        }),
        prisma.credential.findUnique({
          where: { id: data.imgbbCredentialId, userId },
        }),
      ]);
      return { hfCredential: hf, imgbbCredential: ibb };
    },
  );

  if (!hfCredential || !imgbbCredential) {
    await step.realtime.publish(
      `node-error-db-${nodeId}`,
      blackForestChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError(
      "BLACK_FOREST: One or more credentials not found",
    );
  }

  try {
    const hfKey = decrypt(hfCredential.value);
    const imgbbKey = decrypt(imgbbCredential.value);

    const hf = new InferenceClient(hfKey);

    const imageUrl = await step.run(
      `hf-generate-upload-${nodeId}`,
      async () => {
        const response = await hf.textToImage({
          inputs: prompt,
          model: data.model || "black-forest-labs/FLUX.1-schnell",
        });

        const blob = response as unknown as Blob;
        const buffer = Buffer.from(await blob.arrayBuffer());
        const base64Image = buffer.toString("base64");

        const formData = new FormData();
        formData.append("image", base64Image);

        const uploadRes = await fetch(
          `https://api.imgbb.com/1/upload?key=${imgbbKey}`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!uploadRes.ok) {
          throw new Error(`ImgBB upload failed: ${uploadRes.statusText}`);
        }

        const uploadData = await uploadRes.json();
        return uploadData.data.url;
      },
    );

    await step.realtime.publish(
      `node-success-${nodeId}`,
      blackForestChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return {
      ...context,
      [data.variableName]: imageUrl,
    };
  } catch (error: any) {
    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      blackForestChannel.status,
      {
        nodeId,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 300));

    throw error;
  }
};
