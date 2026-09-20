export interface ImageGenerationPreview {
  kind: string;
  title: string;
  prompt: string;
  negativePrompt?: string;
  referenceImages: Array<{ kind: string; label: string; url: string; assetId?: string }>;
  provider: string;
  size: string;
  availableProviders?: Array<{ value: string; label: string }>;
  availableSizes?: string[];
}

export interface ImageGenerationOverrides {
  promptOverride?: string;
  providerOverride?: string;
  sizeOverride?: string;
  negativePromptOverride?: string;
  excludedReferenceImageUrls?: string[];
}
