export enum FalImageSizeEnum {
  SQUARE_HD = "square_hd",
  SQUARE = "square",
  PORTRAIT_4_3 = "portrait_4_3",
  PORTRAIT_16_9 = "portrait_16_9",
  LANDSCAPE_4_3 = "landscape_4_3",
  LANDSCAPE_16_9 = "landscape_16_9",
  AUTO = "auto",
  AUTO_2K = "auto_2K",
  AUTO_4K = "auto_4K",
}

export enum EnhancePromptModeEnum {
  STANDARD = "standard",
  FAST = "fast",
}

export type ImageGenerationRequestStatus = "pending" | "completed" | "failed";

export type ImageGenerationRecord = {
  id: string;
  userId: string;
  prompt: string;
  status: ImageGenerationRequestStatus;
  falStatus?: string;
  errorMessage?: string;
  inputImageKeys: string[];
  inputImageUrls: string[];
  falRequestId?: string;
  outputImageKeys: string[];
  outputImageUrls: string[];
  responsePayload?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type ImageGenerationSubmissionResponse = {
  requestId: string;
  record: ImageGenerationRecord;
};

export type EditImageRequestPayload = {
  prompt: string;
  imageSize?: FalImageSizeEnum;
  imageWidth?: number;
  imageHeight?: number;
  numImages?: number;
  maxImages?: number;
  seed?: number;
  syncMode?: boolean;
  enableSafetyChecker?: boolean;
  enhancePromptMode?: EnhancePromptModeEnum;
};
