import { embed } from "ai";
import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import prisma from "@/lib/db";

const defaultEmbeddingModel = google.textEmbeddingModel("text-embedding-004");

export async function generateEmbedding(
  text: string,
  geminiApiKey?: string,
): Promise<number[]> {
  const model = geminiApiKey
    ? createGoogleGenerativeAI({ apiKey: geminiApiKey }).textEmbeddingModel(
        "text-embedding-004",
      )
    : defaultEmbeddingModel;

  const { embedding } = await embed({
    model,
    value: text,
  });

  return embedding;
}

export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 100,
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end).trim());
    start += chunkSize - overlap;
  }

  return chunks.filter((chunk) => chunk.length > 50);
}

export async function storeMemory(params: {
  userId: string;
  namespace: string;
  content: string;
  metadata?: Record<string, unknown>;
  geminiApiKey?: string;
}): Promise<number> {
  const chunks = chunkText(params.content);

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk, params.geminiApiKey);
    const vectorString = `[${embedding.join(",")}]`;

    await prisma.$executeRaw`
      INSERT INTO workflow_memory (
        id,
        "userId",
        namespace,
        content,
        metadata,
        embedding,
        "createdAt"
      )
      VALUES (
        gen_random_uuid()::text,
        ${params.userId},
        ${params.namespace},
        ${chunk},
        ${params.metadata ? JSON.stringify(params.metadata) : null}::jsonb,
        ${vectorString}::vector,
        NOW()
      )
    `;
  }

  return chunks.length;
}

export async function searchMemory(params: {
  userId: string;
  namespace: string;
  query: string;
  limit?: number;
  minSimilarity?: number;
  geminiApiKey?: string;
}): Promise<{ content: string; similarity: number; metadata: unknown }[]> {
  const queryEmbedding = await generateEmbedding(
    params.query,
    params.geminiApiKey,
  );
  const vectorString = `[${queryEmbedding.join(",")}]`;

  return prisma.$queryRaw<
    { content: string; similarity: number; metadata: unknown }[]
  >`
    SELECT
      content,
      metadata,
      1 - (embedding <=> ${vectorString}::vector) AS similarity
    FROM workflow_memory
    WHERE "userId" = ${params.userId}
      AND namespace = ${params.namespace}
      AND 1 - (embedding <=> ${vectorString}::vector) > ${
        params.minSimilarity ?? 0.7
      }
    ORDER BY similarity DESC
    LIMIT ${params.limit ?? 5}
  `;
}
