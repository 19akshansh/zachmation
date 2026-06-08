import { NodeType } from "@/generated/prisma/enums";

export const PRO_NODES = new Set<NodeType>([
  NodeType.STRIPE_TRIGGER,
  NodeType.OPENAI,
  NodeType.ANTHROPIC,
  NodeType.BLACK_LABS,
  NodeType.SLACK,
]);