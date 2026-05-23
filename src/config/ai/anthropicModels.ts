export const ANTHROPIC_MODELS = [
  {
    id: "claude-3-7-sonnet-latest",
    label: "Claude 3.7 Sonnet",
  },
  {
    id: "claude-3-5-sonnet-latest",
    label: "Claude 3.5 Sonnet",
  },
  {
    id: "claude-3-5-haiku-latest",
    label: "Claude 3.5 Haiku",
  },
] as const;

export type AnthropicModelId =
  (typeof ANTHROPIC_MODELS)[number]["id"];