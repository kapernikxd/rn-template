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
  preview: string; // object URL
  file: File;
};

export type StepDef = { title: string; description: string };
