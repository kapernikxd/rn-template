// hooks/useEditAiAgentDialog.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEventHandler, FormEventHandler, KeyboardEvent } from "react";
import { useRootStore, useStoreData } from "../../../store/StoreProvider";
import { AiBotDTO } from "../../../types";
import { getUserAvatar } from "../../utils/user";
import { AiBotUpdatePayload } from "../../../types/aiBot";


export interface EditAiAgentFormState {
  name: string;
  lastname: string;
  profession: string;
  userBio: string;
  aiPrompt: string;
  intro: string;
  categories: string[];
  usefulness: string[];
}

const INITIAL_FORM: EditAiAgentFormState = {
  name: "",
  lastname: "",
  profession: "",
  userBio: "",
  aiPrompt: "",
  intro: "",
  categories: [],
  usefulness: [],
};

const normalized = (v: string) => v.trim().toLowerCase();
const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((item, i) => item === b[i]);

export function useEditAiAgentDialog(open: boolean, aiAgent: AiBotDTO | null, onClose: () => void) {
  const { aiBotStore } = useRootStore();

  // store-derived
  const botDetails = useStoreData(aiBotStore, (s) => s.botDetails);
  const botPhotos = useStoreData(aiBotStore, (s) => s.botPhotos);
  const photosUpdating = useStoreData(aiBotStore, (s) => s.photosUpdating);
  const maxGalleryItems = aiBotStore.maxGalleryItems;

  // local state
  const [formState, setFormState] = useState<EditAiAgentFormState>(INITIAL_FORM);
  const [usefulnessInput, setUsefulnessInput] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tempUrlRef = useRef<string | null>(null);
  const initialAvatarRef = useRef<string | null>(null);

  // init on open
  useEffect(() => {
    if (!open || !aiAgent) return;

    const next: EditAiAgentFormState = {
      name: aiAgent.name ?? "",
      lastname: aiAgent.lastname ?? "",
      profession: aiAgent.profession ?? "",
      userBio: aiAgent.userBio ?? "",
      aiPrompt: botDetails?.aiPrompt ?? aiAgent.aiPrompt ?? "",
      intro: botDetails?.intro ?? aiAgent.intro ?? "",
      categories: botDetails?.categories ?? aiAgent.categories ?? [],
      usefulness: botDetails?.usefulness ?? aiAgent.usefulness ?? [],
    };

    setFormState(next);
    setUsefulnessInput("");
    setAvatarFile(null);

    const avatar = aiAgent.avatarFile ? getUserAvatar(aiAgent) : null;
    initialAvatarRef.current = avatar;
    setAvatarPreview(avatar);

    if (tempUrlRef.current) {
      URL.revokeObjectURL(tempUrlRef.current);
      tempUrlRef.current = null;
    }
  }, [open, aiAgent, botDetails]);

  // cleanup temp url
  useEffect(() => {
    return () => {
      if (tempUrlRef.current) URL.revokeObjectURL(tempUrlRef.current);
    };
  }, []);

  // avatar
  const handleAvatarSelect = useCallback((file: File) => {
    if (tempUrlRef.current) URL.revokeObjectURL(tempUrlRef.current);
    const url = URL.createObjectURL(file);
    tempUrlRef.current = url;
    setAvatarFile(file);
    setAvatarPreview(url);
  }, []);

  const handleAvatarRemove = useCallback(() => {
    if (tempUrlRef.current) {
      URL.revokeObjectURL(tempUrlRef.current);
      tempUrlRef.current = null;
    }
    setAvatarFile(null);
    setAvatarPreview(initialAvatarRef.current);
  }, []);

  // categories
  const toggleCategory = useCallback((category: string) => {
    setFormState((prev) => {
      const key = normalized(category);
      const exists = prev.categories.some((i) => normalized(i) === key);
      const next = exists
        ? prev.categories.filter((i) => normalized(i) !== key)
        : [...prev.categories, category];
      return { ...prev, categories: next };
    });
  }, []);

  // usefulness
  const handleAddUsefulness = useCallback(() => {
    const value = usefulnessInput.trim();
    if (!value) return;
    setFormState((prev) => {
      const exists = prev.usefulness.some((i) => normalized(i) === normalized(value));
      return exists ? prev : { ...prev, usefulness: [...prev.usefulness, value] };
    });
    setUsefulnessInput("");
  }, [usefulnessInput]);

  const handleRemoveUsefulness = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, usefulness: prev.usefulness.filter((i) => i !== value) }));
  }, []);

  const handleUsefulnessKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUsefulness();
    }
  }, [handleAddUsefulness]);

  // gallery
  const remainingGallerySlots = Math.max(0, maxGalleryItems - botPhotos.length);
  const canUploadPhotos = remainingGallerySlots > 0 && !photosUpdating;

  const handleGalleryUpload: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    if (!aiAgent) return;
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const remaining = Math.max(0, maxGalleryItems - botPhotos.length);
    if (remaining === 0) return;

    const allowed = files.slice(0, remaining);
    const formData = new FormData();
    allowed.forEach((file) => formData.append("photos", file, file.name));

    void aiBotStore.addBotPhotos(aiAgent._id, formData);
    event.currentTarget.value = "";
  }, [aiAgent, aiBotStore, botPhotos.length, maxGalleryItems]);

  const handleRemovePhoto = useCallback((url: string) => {
    if (!aiAgent) return;
    void aiBotStore.deleteBotPhotos(aiAgent._id, [url]);
  }, [aiAgent, aiBotStore]);

  // submit
  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async (event) => {
    event.preventDefault();
    if (!aiAgent) {
      onClose();
      return;
    }

    const hasAvatarUpdate = Boolean(avatarFile);
    const payload: AiBotUpdatePayload = {};

    const normalizedName = formState.name.trim();
    const normalizedLastName = formState.lastname.trim();
    const normalizedProfession = formState.profession.trim();
    const normalizedBio = formState.userBio.trim();
    const normalizedPrompt = formState.aiPrompt.trim();
    const normalizedIntro = formState.intro.trim();

    const currentPrompt = botDetails?.aiPrompt ?? aiAgent.aiPrompt ?? "";
    const currentIntro = botDetails?.intro ?? aiAgent.intro ?? "";
    const currentCategories = botDetails?.categories ?? aiAgent.categories ?? [];
    const currentUsefulness = botDetails?.usefulness ?? aiAgent.usefulness ?? [];

    if (normalizedName !== (aiAgent.name ?? "")) payload.name = normalizedName;
    if (normalizedLastName !== (aiAgent.lastname ?? "")) payload.lastname = normalizedLastName;
    if (normalizedProfession !== (aiAgent.profession ?? "")) payload.profession = normalizedProfession;
    if (normalizedBio !== (aiAgent.userBio ?? "")) payload.userBio = normalizedBio;
    if (normalizedPrompt !== currentPrompt) payload.aiPrompt = normalizedPrompt;
    if (normalizedIntro !== currentIntro) {
      payload.intro = normalizedIntro;
      payload.introMessage = normalizedIntro;
    }
    if (!arraysEqual(formState.categories, currentCategories)) payload.categories = formState.categories;
    if (!arraysEqual(formState.usefulness, currentUsefulness)) payload.usefulness = formState.usefulness;

    const hasTextUpdates = Object.keys(payload).length > 0;
    if (!hasTextUpdates && !hasAvatarUpdate) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await aiBotStore.updateBot(aiAgent._id, payload, avatarFile ?? undefined);
      onClose();
    } catch (e) {
      console.error("Failed to update AI agent", e);
    } finally {
      setIsSubmitting(false);
    }
  }, [aiAgent, onClose, avatarFile, formState, botDetails, aiBotStore]);

  // computed for view
  const charCounters = useMemo(
    () => ({
      name: formState.name.length.toString().padStart(2, "0"),
      lastname: formState.lastname.length.toString().padStart(2, "0"),
      profession: formState.profession.length.toString().padStart(2, "0"),
      userBio: formState.userBio.length.toString().padStart(3, "0"),
    }),
    [formState]
  );

  const selectedCategories = useMemo(
    () => new Set(formState.categories.map((item) => normalized(item))),
    [formState.categories]
  );

  return {
    // store data
    botDetails,
    botPhotos,
    photosUpdating,
    maxGalleryItems,

    // local state
    formState, setFormState,
    usefulnessInput, setUsefulnessInput,
    avatarFile, avatarPreview,
    isSubmitting,

    // computed
    charCounters,
    selectedCategories,
    remainingGallerySlots,
    canUploadPhotos,

    // handlers
    handleAvatarSelect,
    handleAvatarRemove,
    toggleCategory,
    handleAddUsefulness,
    handleRemoveUsefulness,
    handleUsefulnessKeyDown,
    handleGalleryUpload,
    handleRemovePhoto,
    handleSubmit,
  } as const;
}
