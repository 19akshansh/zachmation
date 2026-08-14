// Updated 14 Aug 2026. GPT-4.1(-mini/nano), GPT-4o(-mini), o3, and o4-mini are
// all superseded by the GPT-5.x line, and o4-mini / gpt-4.1-nano / gpt-4o are
// already on OpenAI's Oct 23, 2026 deprecation schedule. o3 and the original
// gpt-5 snapshots are on the Dec 11, 2026 schedule. Moved straight to the
// current GPT-5.6 family so nothing here is already living on borrowed time.
export const OPENAI_MODELS = [
  {
    id: "gpt-5.6-sol",
    label: "GPT-5.6 Sol",
  },
  {
    id: "gpt-5.6-terra",
    label: "GPT-5.6 Terra",
  },
  {
    id: "gpt-5.6-luna",
    label: "GPT-5.6 Luna",
  },
] as const;

export type OpenAIModelId = (typeof OPENAI_MODELS)[number]["id"];
