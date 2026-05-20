// GENERATED WITH AI!!!!!! Interfere with CAUTION.

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
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
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
    contextWindow: 1_000_000,
    availableInSDK: true,
    recommended: true,
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
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
    contextWindow: 1_000_000,
    availableInSDK: true,
    recommended: true,
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
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
    recommended: true,
  },
  {
    id: "gemini-3.1-pro-preview",
    label: "Gemini 3.1 Pro Preview",
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
  },

  // =========================
  // IMAGE
  // =========================

  {
    id: "gemini-2.5-flash-image",
    label: "Nano Banana",
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
    id: "imagen-4",
    label: "Imagen 4",
    provider: "google",
    category: "image",
    releaseChannel: "stable",
    supportsTextInput: true,
    supportsTextOutput: false,
    supportsImageGeneration: true,
    availableInSDK: true,
  },
  {
    id: "gemini-3-pro-image-preview",
    label: "Nano Banana Pro",
    provider: "google",
    category: "image",
    releaseChannel: "preview",
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

  // =========================
  // EMBEDDINGS
  // =========================

  {
    id: "gemini-embedding-2",
    label: "Gemini Embedding 2",
    provider: "google",
    category: "embedding",
    releaseChannel: "stable",
    supportsTextInput: true,
    supportsTextOutput: false,
    availableInSDK: true,
    recommended: true,
  },

  {
    id: "gemini-embedding-001",
    label: "Gemini Embedding 001",
    provider: "google",
    category: "embedding",
    releaseChannel: "stable",
    supportsTextInput: true,
    supportsTextOutput: false,
    availableInSDK: true,
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
