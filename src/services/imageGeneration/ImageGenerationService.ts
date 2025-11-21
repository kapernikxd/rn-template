import { AxiosResponse } from "axios";
import type { Asset } from "react-native-image-picker";

import $api from "../../helpers/http";
import type {
  EditImageRequestPayload,
  ImageGenerationRecord,
  ImageGenerationSubmissionResponse,
} from "../../types/imageGeneration";

const IMAGE_FIELD = "images";

const DEFAULT_FILE_NAME = "image.jpg";
const DEFAULT_MIME_TYPE = "image/jpeg";

function normalizeFormDataValue(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

function appendImages(formData: FormData, images: Asset[]) {
  images.forEach((asset, index) => {
    if (!asset?.uri) {
      return;
    }
    const file = {
      uri: asset.uri,
      name: asset.fileName ?? `${index}_${DEFAULT_FILE_NAME}`,
      type: asset.type ?? DEFAULT_MIME_TYPE,
    };

    formData.append(IMAGE_FIELD, file as unknown as Blob);
  });
}

class ImageGenerationService {
  async editImage(
    payload: EditImageRequestPayload,
    images: Asset[],
  ): Promise<ImageGenerationSubmissionResponse> {
    const formData = new FormData();

    formData.append("prompt", payload.prompt);
    formData.append("case", payload.case);

    if (payload.imageSize) {
      formData.append("imageSize", payload.imageSize);
    }

    if (payload.imageWidth !== undefined) {
      formData.append("imageWidth", normalizeFormDataValue(payload.imageWidth));
    }

    if (payload.imageHeight !== undefined) {
      formData.append("imageHeight", normalizeFormDataValue(payload.imageHeight));
    }

    if (payload.numImages !== undefined) {
      formData.append("numImages", normalizeFormDataValue(payload.numImages));
    }

    if (payload.maxImages !== undefined) {
      formData.append("maxImages", normalizeFormDataValue(payload.maxImages));
    }

    if (payload.seed !== undefined) {
      formData.append("seed", normalizeFormDataValue(payload.seed));
    }

    if (payload.syncMode !== undefined) {
      formData.append("syncMode", normalizeFormDataValue(payload.syncMode));
    }

    if (payload.enableSafetyChecker !== undefined) {
      formData.append(
        "enableSafetyChecker",
        normalizeFormDataValue(payload.enableSafetyChecker),
      );
    }

    if (payload.enhancePromptMode) {
      formData.append("enhancePromptMode", payload.enhancePromptMode);
    }

    appendImages(formData, images);

    const response: AxiosResponse<ImageGenerationSubmissionResponse> = await $api.post(
      "/image-generation/edit",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  }

  async listRequests(): Promise<ImageGenerationRecord[]> {
    const response: AxiosResponse<ImageGenerationRecord[]> = await $api.get(
      "/image-generation/requests",
    );

    return response.data;
  }

  async refreshRequest(id: string): Promise<ImageGenerationRecord> {
    const response: AxiosResponse<ImageGenerationRecord> = await $api.post(
      `/image-generation/requests/${id}/refresh`,
    );

    return response.data;
  }
}

const imageGenerationService = new ImageGenerationService();

export default imageGenerationService;
export type { EditImageRequestPayload, ImageGenerationRecord };
