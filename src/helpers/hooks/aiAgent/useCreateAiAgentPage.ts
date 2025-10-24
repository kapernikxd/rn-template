// hooks/useCreateAiAgentPage.ts
"use client";

import { useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import { useRootStore, useStoreData } from "../../../store/StoreProvider";
import { isLikelyImage, normalizeImageToJpeg } from "../../utils/image";
import { usePortalNavigation } from "../useNavigation";
import type { AvatarFile } from "../../../types/profile";

const isAvatarFile = (file: AvatarFile | File): file is AvatarFile =>
  typeof (file as AvatarFile)?.uri === "string";

export function useCreateAiAgentPage() {
  const { aiBotStore } = useRootStore();
  const { goToAiBotProfile } = usePortalNavigation();

  // store-backed state
  const step = useStoreData(aiBotStore, (s) => s.step);
  const form = useStoreData(aiBotStore, (s) => s.form);
  const avatarPreview = useStoreData(aiBotStore, (s) => s.avatarPreview);
  const gallery = useStoreData(aiBotStore, (s) => s.gallery);
  const completed = useStoreData(aiBotStore, (s) => s.completed);
  const currentStepComplete = useStoreData(aiBotStore, (s) => s.currentStepComplete);
  const isSubmitting = useStoreData(aiBotStore, (s) => s.isSubmitting);
  const creationError = useStoreData(aiBotStore, (s) => s.creationError);
  const createdBot = useStoreData(aiBotStore, (s) => s.createdBot);
  const steps = aiBotStore.steps;
  const maxGalleryItems = aiBotStore.maxGalleryItems;

  // dispose on unmount
  useEffect(() => () => aiBotStore.dispose(), [aiBotStore]);

  // handlers
  const setAvatarFile = useCallback(
    async (file: AvatarFile | File | null) => {
      if (!file) {
        aiBotStore.setAvatar(null);
        return;
      }

      if (isAvatarFile(file)) {
        aiBotStore.setAvatar(file);
        return;
      }

      if (!isLikelyImage(file)) {
        console.warn("Selected file is not a supported image format.");
        return;
      }

      try {
        const normalized = await normalizeImageToJpeg(file);
        aiBotStore.setAvatar(normalized);
      } catch (error) {
        console.error("Failed to process avatar image", error);
      }
    },
    [aiBotStore],
  );

  const addGalleryFiles = useCallback(
    async (files: (AvatarFile | File)[]) => {
      if (!files.length) {
        return;
      }

      const remaining = Math.max(0, maxGalleryItems - gallery.length);
      if (remaining === 0) {
        return;
      }

      const allowed = files.slice(0, remaining);
      const processed: (AvatarFile | File)[] = [];

      for (const file of allowed) {
        if (isAvatarFile(file)) {
          processed.push(file);
          continue;
        }

        if (!isLikelyImage(file)) {
          console.warn("Skipped non-image file in gallery upload:", file.name);
          continue;
        }

        try {
          const normalized = await normalizeImageToJpeg(file);
          processed.push(normalized);
        } catch (error) {
          console.error("Failed to process gallery image", error);
        }
      }

      if (processed.length) {
        aiBotStore.addGalleryItems(processed);
      }
    },
    [aiBotStore, gallery.length, maxGalleryItems],
  );

  const handleAvatarChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      await setAvatarFile(file);
      event.currentTarget.value = "";
    },
    [setAvatarFile],
  );

  const handleGalleryChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      await addGalleryFiles(files);
      event.currentTarget.value = "";
    },
    [addGalleryFiles],
  );

  const removeGalleryItem = useCallback((id: string) => {
    aiBotStore.removeGalleryItem(id);
  }, [aiBotStore]);

  const resetFlow = useCallback(() => {
    aiBotStore.resetFlow();
  }, [aiBotStore]);

  const handleChange = useCallback(<K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    aiBotStore.setFormField(field, value);
  }, [aiBotStore, form]);

  const goNext = useCallback(() => {
    if (step === steps.length - 1) {
      void aiBotStore.submitCreation();
      return;
    }
    aiBotStore.goNext();
  }, [aiBotStore, step, steps.length]);

  const goPrev = useCallback(() => {
    aiBotStore.goPrev();
  }, [aiBotStore]);

  const goToStep = useCallback(
    (targetStep: number) => {
      if (targetStep < 0 || targetStep >= steps.length) {
        return;
      }

      if (targetStep > step) {
        return;
      }

      aiBotStore.setStep(targetStep);
    },
    [aiBotStore, step, steps.length],
  );

  return {
    // data
    step, form, avatarPreview, gallery, completed, currentStepComplete, isSubmitting,
    creationError, createdBot, steps, maxGalleryItems,
    getAiProfile: goToAiBotProfile,

    // handlers
    handleAvatarChange, handleGalleryChange, removeGalleryItem,
    resetFlow, handleChange, goNext, goPrev, goToStep,
    setAvatarFile, addGalleryFiles,
  } as const;
}
