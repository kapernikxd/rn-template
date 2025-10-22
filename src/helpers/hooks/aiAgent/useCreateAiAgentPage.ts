// hooks/useCreateAiAgentPage.ts
"use client";

import { useEffect, useMemo, useCallback } from "react";
import type { ChangeEvent } from "react";
import { useRootStore, useStoreData } from "../../../store/StoreProvider";
import { isLikelyImage, normalizeImageToJpeg } from "../../utils/image";
import { usePortalNavigation } from "../useNavigation";

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

  // i18n for steps
  const translatedSteps = useMemo(() => {
    const stepKeys = ["identity", "focus", "voice", "media"] as const;
    return steps.map((currentStep, index) => {
      const key = stepKeys[index] ?? `step${index}`;
      return {
        ...currentStep,
        title: currentStep.title,
        description: currentStep.description,
      };
    });
  }, [steps]);

  // dispose on unmount
  useEffect(() => () => aiBotStore.dispose(), [aiBotStore]);

  // handlers
  const handleAvatarChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      aiBotStore.setAvatar(null);
      return;
    }
    if (!isLikelyImage(file)) {
      console.warn("Selected file is not a supported image format.");
      event.currentTarget.value = "";
      return;
    }
    try {
      const normalized = await normalizeImageToJpeg(file);
      aiBotStore.setAvatar(normalized);
    } catch (error) {
      console.error("Failed to process avatar image", error);
    } finally {
      event.currentTarget.value = "";
    }
  }, [aiBotStore]);

  const handleGalleryChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      event.currentTarget.value = "";
      return;
    }
    const remaining = Math.max(0, maxGalleryItems - gallery.length);
    if (remaining === 0) {
      event.currentTarget.value = "";
      return;
    }
    const allowed = files.slice(0, remaining).filter((file) => {
      if (isLikelyImage(file)) return true;
      console.warn("Skipped non-image file in gallery upload:", file.name);
      return false;
    });
    if (!allowed.length) {
      event.currentTarget.value = "";
      return;
    }
    try {
      const normalized = await Promise.all(allowed.map((f) => normalizeImageToJpeg(f)));
      aiBotStore.addGalleryItems(normalized);
    } catch (error) {
      console.error("Failed to process gallery images", error);
    } finally {
      event.currentTarget.value = "";
    }
  }, [aiBotStore, gallery.length, maxGalleryItems]);

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

  return {
    // data
    step, form, avatarPreview, gallery, completed, currentStepComplete, isSubmitting,
    creationError, createdBot, steps: translatedSteps, maxGalleryItems,
    getAiProfile: goToAiBotProfile,

    // handlers
    handleAvatarChange, handleGalleryChange, removeGalleryItem,
    resetFlow, handleChange, goNext, goPrev,
  } as const;
}
