// Updated 14 Aug 2026. Claude Sonnet 4 / Opus 4 were deprecated Apr 14, 2026
// (retired Apr 20, 2026), and Claude 3.7 Sonnet / 3.5 Sonnet / 3.5 Haiku are
// all fully retired. Current active first-party lineup only.
export const ANTHROPIC_MODELS = [
  {
    id: "claude-sonnet-5",
    label: "Claude Sonnet 5",
  },
  {
    id: "claude-opus-5",
    label: "Claude Opus 5",
  },
  {
    id: "claude-haiku-4-5",
    label: "Claude Haiku 4.5",
  },
  {
    id: "claude-fable-5",
    label: "Claude Fable 5",
  },
] as const;

export type AnthropicModelId = (typeof ANTHROPIC_MODELS)[number]["id"];
