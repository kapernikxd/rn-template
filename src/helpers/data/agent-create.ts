import { StepDef } from "../../types/aiBot";

export const steps: StepDef[] = [
  { title: "Identity", description: "Avatar, name, and the first impression." },
  { title: "Focus", description: "Choose categories and the value it delivers." },
  { title: "Voice & Story", description: "Craft the agent prompt, description, and intro." },
  { title: "Media Kit", description: "Upload supporting visuals to set the mood." },
];

export const categoryOptions = [
  "Обучение",
  "Английский",
  "Для прикола",
  "Романтический",
  "Роли",
  "История",
];

export const MAX_GALLERY_ITEMS = 6;
