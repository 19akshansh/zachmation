export const BLACK_FOREST_MODELS = [
  { id: "black-forest-labs/FLUX.1-schnell", label: "FLUX.1 Schnell (Fast)" },
  { id: "black-forest-labs/FLUX.1-dev", label: "FLUX.1 Dev (High Quality)" },
] as const;

export type BlackForestModel = (typeof BLACK_FOREST_MODELS)[number];

export type BlackForestModelId = BlackForestModel["id"];
