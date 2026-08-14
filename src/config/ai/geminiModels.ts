// Updated 14 Aug 2026. Gemini 2.5 Pro / Flash / Flash-Lite are all on Google's
// deprecation schedule (shutdown Oct 16, 2026 per the Gemini API deprecations
// page), so they're removed entirely per the "don't ship models that are
// already scheduled to die" rule. Gemini 3 Pro Preview and the 2.0 Flash line
// are already fully shut down and removed. Imagen 4 is deprecated (shutdown
// Aug 17, 2026) in favor of the Nano Banana 2 family. Everything below is
// current per ai.google.dev/gemini-api/docs/models (last checked today).

export type GoogleModelCategory =
  | "chat"
  | "image"
  | "audio"
  | "video"
  | "music"
  | "embedding"
  | "agent"
  | "robotics";

export interface GoogleModel {
  id: string;
  label: string;
  provider: "google";
  category: GoogleModelCategory;
  releaseChannel: "stable" | "preview" | "experimental" | "deprecated";
  deprecated?: boolean;
  supportsTextInput: boolean;
  supportsTextOutput: boolean;
  supportsVision?: boolean;
  supportsAudioInput?: boolean;
  supportsAudioOutput?: boolean;
  supportsVideoInput?: boolean;
  supportsImageGeneration?: boolean;
  supportsImageEditing?: boolean;
  supportsMusicGeneration?: boolean;
  supportsTools?: boolean;
  supportsStreaming?: boolean;
  supportsReasoning?: boolean;
  supportsJson?: boolean;
  contextWindow?: number;
  outputTokenLimit?: number;
  pricing?: {
    input?: number;
    output?: number;
    cachedInput?: number;
  };
  availableInSDK?: boolean;
  recommended?: boolean;
}

export const GOOGLE_MODELS = [
  // =========================
  // CHAT
  // =========================

  {
    id: "gemini-3.7-flash",
    label: "Gemini 3.7 Flash",
    provider: "google",
    category: "chat",
    releaseChannel: "stable",
    supportsTextInput: true,
    supportsTextOutput: true,
    supportsVision: true,
    supportsTools: true,
    supportsStreaming: true,
    supportsReasoning: true,
    supportsJson: true,
    contextWindow: 2_000_000,
    availableInSDK: true,
    recommended: true,
  },
  {
    id: "gemini-3.1-pro-preview",
    label: "Gemini 3.1 Pro",
    provider: "google",
    category: "chat",
    releaseChannel: "preview",
    supportsTextInput: true,
    supportsTextOutput: true,
    supportsVision: true,
    supportsTools: true,
    supportsStreaming: true,
    supportsReasoning: true,
    supportsJson: true,
    contextWindow: 2_000_000,
    availableInSDK: true,
    recommended: true,
  },
  {
    id: "gemini-3.6-flash",
    label: "Gemini 3.6 Flash",
    provider: "google",
    category: "chat",
    releaseChannel: "stable",
    supportsTextInput: true,
    supportsTextOutput: true,
    supportsVision: true,
    supportsTools: true,
    supportsStreaming: true,
    supportsReasoning: true,
    supportsJson: true,
    contextWindow: 2_000_000,
    availableInSDK: true,
  },
  {
    id: "gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    provider: "google",
    category: "chat",
    releaseChannel: "stable",
    supportsTextInput: true,
    supportsTextOutput: true,
    supportsVision: true,
    supportsTools: true,
    supportsStreaming: true,
    supportsReasoning: true,
    supportsJson: true,
    contextWindow: 2_000_000,
    availableInSDK: true,
  },
  {
    id: "gemini-3.5-flash-lite",
    label: "Gemini 3.5 Flash-Lite",
    provider: "google",
    category: "chat",
    releaseChannel: "stable",
    supportsTextInput: true,
    supportsTextOutput: true,
    supportsVision: true,
    supportsTools: true,
    supportsStreaming: true,
    supportsJson: true,
    contextWindow: 1_000_000,
    availableInSDK: true,
  },
  {
    id: "gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash-Lite",
    provider: "google",
    category: "chat",
    releaseChannel: "stable",
    supportsTextInput: true,
    supportsTextOutput: true,
    supportsVision: true,
    supportsTools: true,
    supportsStreaming: true,
    supportsJson: true,
    contextWindow: 1_000_000,
    availableInSDK: true,
  },

  // =========================
  // IMAGE
  // =========================

  {
    id: "gemini-3.1-flash-image",
    label: "Nano Banana 2",
    provider: "google",
    category: "image",
    releaseChannel: "stable",
    supportsTextInput: true,
    supportsTextOutput: false,
    supportsImageGeneration: true,
    supportsImageEditing: true,
    supportsStreaming: false,
    availableInSDK: true,
    recommended: true,
  },
  {
    id: "gemini-3-pro-image",
    label: "Nano Banana Pro",
    provider: "google",
    category: "image",
    releaseChannel: "stable",
    supportsTextInput: true,
    supportsTextOutput: false,
    supportsImageGeneration: true,
    supportsImageEditing: true,
    availableInSDK: true,
  },
  {
    id: "gemini-3.1-flash-lite-image",
    label: "Nano Banana 2 Lite",
    provider: "google",
    category: "image",
    releaseChannel: "stable",
    supportsTextInput: true,
    supportsTextOutput: false,
    supportsImageGeneration: true,
    supportsImageEditing: true,
    availableInSDK: true,
  },

  // =========================
  // AUDIO
  // =========================

  {
    id: "gemini-3.1-flash-live-preview",
    label: "Gemini 3.1 Flash Live",
    provider: "google",
    category: "audio",
    releaseChannel: "preview",
    supportsTextInput: true,
    supportsTextOutput: true,
    supportsAudioInput: true,
    supportsAudioOutput: false,
    supportsStreaming: true,
    availableInSDK: true,
  },
  {
    id: "gemini-3.1-flash-tts-preview",
    label: "Gemini 3.1 Flash TTS",
    provider: "google",
    category: "audio",
    releaseChannel: "preview",
    supportsTextInput: true,
    supportsTextOutput: false,
    supportsAudioOutput: true,
    supportsStreaming: true,
    availableInSDK: true,
  },

  // =========================
  // VIDEO
  // =========================

  {
    id: "veo-3.1-generate-preview",
    label: "Veo 3.1",
    provider: "google",
    category: "video",
    releaseChannel: "preview",
    supportsTextInput: true,
    supportsTextOutput: false,
    supportsVideoInput: false,
    availableInSDK: false,
  },
  {
    id: "veo-3.1-lite-generate-preview",
    label: "Veo 3.1 Lite",
    provider: "google",
    category: "video",
    releaseChannel: "preview",
    supportsTextInput: true,
    supportsTextOutput: false,
    supportsVideoInput: false,
    availableInSDK: false,
  },

  // =========================
  // MUSIC
  // =========================

  {
    id: "lyria-3-pro-preview",
    label: "Lyria 3 Pro",
    provider: "google",
    category: "music",
    releaseChannel: "preview",
    supportsTextInput: true,
    supportsTextOutput: false,
    supportsMusicGeneration: true,
    availableInSDK: false,
  },
  {
    id: "lyria-3-clip-preview",
    label: "Lyria 3 Clip",
    provider: "google",
    category: "music",
    releaseChannel: "preview",
    supportsTextInput: true,
    supportsTextOutput: false,
    supportsMusicGeneration: true,
    availableInSDK: false,
  },

  // =========================
  // EMBEDDINGS
  // =========================

  {
    id: "gemini-embedding-2-preview",
    label: "Gemini Embedding 2",
    provider: "google",
    category: "embedding",
    releaseChannel: "preview",
    supportsTextInput: true,
    supportsTextOutput: false,
    availableInSDK: true,
    recommended: true,
  },

  // =========================
  // AGENTS
  // =========================

  {
    id: "deep-research-preview-04-2026",
    label: "Gemini Deep Research",
    provider: "google",
    category: "agent",
    releaseChannel: "preview",
    supportsTextInput: true,
    supportsTextOutput: true,
    supportsTools: true,
    supportsReasoning: true,
    availableInSDK: false,
  },

  {
    id: "deep-research-max-preview-04-2026",
    label: "Gemini Deep Research Max",
    provider: "google",
    category: "agent",
    releaseChannel: "preview",
    supportsTextInput: true,
    supportsTextOutput: true,
    supportsTools: true,
    supportsReasoning: true,
    availableInSDK: false,
  },

  {
    id: "antigravity-preview-05-2026",
    label: "Antigravity Agent",
    provider: "google",
    category: "agent",
    releaseChannel: "preview",
    supportsTextInput: true,
    supportsTextOutput: true,
    supportsTools: true,
    supportsReasoning: true,
    availableInSDK: false,
  },
] as const satisfies readonly GoogleModel[];

export type GoogleModelId = (typeof GOOGLE_MODELS)[number]["id"];
