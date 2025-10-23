import type { AvatarFile } from "../profile";

export type CreateAiAgentFormState = {
  firstName: string;
  lastName: string;
  profession: string;
  prompt: string;
  description: string;
  intro: string;
  categories: string[];
  usefulness: string[];
};

export type GalleryItem = {
  id: string;
  preview: string; // object URL or local URI
  file: File | AvatarFile;
};

export type StepDef = { title: string; description: string };
