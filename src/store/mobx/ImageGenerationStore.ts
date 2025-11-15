import { isAxiosError } from "axios";
import type { Asset } from "react-native-image-picker";

import imageGenerationService from "../../services/imageGeneration/ImageGenerationService";
import type {
  EditImageRequestPayload,
  ImageGenerationRecord,
} from "../../types/imageGeneration";
import { getLocalUserId } from "../../helpers/storageHelper";
import { BaseStore, type StoreListener } from "./BaseStore";
import i18n from "../../helpers/i18n";

export class ImageGenerationStore {
  private readonly baseStore = new BaseStore();
  readonly subscribe: (listener: StoreListener) => () => void;

  selectedImages: Asset[] = [];
  isSubmitting = false;
  submitError: string | null = null;
  lastSubmissionRecord: ImageGenerationRecord | null = null;

  requests: ImageGenerationRecord[] = [];
  isLoadingRequests = false;
  isSyncingRequests = false;
  requestsError: string | null = null;

  constructor() {
    this.subscribe = this.baseStore.subscribe;
    void getLocalUserId().catch((error) => {
      console.warn("Failed to ensure local user id", error);
    });
  }

  private notify() {
    this.baseStore.notify();
  }

  get snapshotVersion() {
    return this.baseStore.snapshotVersion;
  }

  get selectedImage(): Asset | null {
    return this.selectedImages[0] ?? null;
  }

  get completedImageUrls(): string[] {
    return this.requests
      .filter((request) => request.status === "completed")
      .flatMap((request) => request.outputImageUrls ?? []);
  }

  get pendingRequestCount(): number {
    return this.requests.filter((request) => request.status !== "completed").length;
  }

  setSelectedImages(images: Asset[]): void {
    this.selectedImages = images;
    this.notify();
  }

  clearSelection(): void {
    this.selectedImages = [];
    this.notify();
  }

  resetRequests(): void {
    const hadState =
      this.requests.length > 0 ||
      this.isLoadingRequests ||
      this.isSyncingRequests ||
      this.requestsError !== null;

    if (!hadState) {
      return;
    }

    this.requests = [];
    this.isLoadingRequests = false;
    this.isSyncingRequests = false;
    this.requestsError = null;
    this.notify();
  }

  private resolveErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
      const message = error.response?.data?.message;
      if (typeof message === "string") {
        return message;
      }
      if (Array.isArray(message) && message.length) {
        const first = message[0];
        if (typeof first === "string") {
          return first;
        }
      }
      if (typeof error.message === "string") {
        return error.message;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return i18n.t('errors.common.generic');
  }

  async submitEditRequest(payload: EditImageRequestPayload): Promise<boolean> {
    if (!this.selectedImages.length) {
      this.submitError = i18n.t('errors.imageGeneration.noImageSelected');
      this.notify();
      return false;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.notify();

    try {
      const response = await imageGenerationService.editImage(payload, this.selectedImages);
      const { record } = response;

      this.lastSubmissionRecord = record;
      this.requests = [
        record,
        ...this.requests.filter((existing) => existing.id !== record.id),
      ];
      this.selectedImages = [];
      this.isSubmitting = false;
      this.notify();
      return true;
    } catch (error) {
      this.isSubmitting = false;
      this.submitError = this.resolveErrorMessage(error);
      this.notify();
      return false;
    }
  }

  async fetchRequests(): Promise<ImageGenerationRecord[]> {
    this.isLoadingRequests = true;
    this.requestsError = null;
    this.notify();

    try {
      const data = await imageGenerationService.listRequests();
      this.requests = data;
      this.isLoadingRequests = false;
      this.notify();
      return data;
    } catch (error) {
      this.isLoadingRequests = false;
      this.requestsError = this.resolveErrorMessage(error);
      this.notify();
      throw error;
    }
  }

  async refreshRequest(id: string): Promise<ImageGenerationRecord | null> {
    try {
      const updated = await imageGenerationService.refreshRequest(id);
      this.requests = this.requests.map((request) =>
        request.id === id ? updated : request,
      );
      this.notify();
      return updated;
    } catch (error) {
      this.requestsError = this.resolveErrorMessage(error);
      this.notify();
      return null;
    }
  }

  async refreshPendingRequests(): Promise<void> {
    const pending = this.requests.filter((request) => request.status !== "completed");
    if (!pending.length) {
      return;
    }

    this.isSyncingRequests = true;
    this.notify();

    try {
      const updates = await Promise.all(
        pending.map(async (request) => {
          try {
            return await imageGenerationService.refreshRequest(request.id);
          } catch (error) {
            return null;
          }
        }),
      );

      const replacements = updates.filter((item): item is ImageGenerationRecord => item !== null);
      if (replacements.length) {
        const map = new Map(replacements.map((item) => [item.id, item] as const));
        this.requests = this.requests.map((item) => map.get(item.id) ?? item);
      }
    } finally {
      this.isSyncingRequests = false;
      this.notify();
    }
  }

  async reloadRequests(): Promise<void> {
    try {
      await this.fetchRequests();
    } catch (error) {
      // Ошибка уже обработана в fetchRequests
    }
    await this.refreshPendingRequests();
  }
}
