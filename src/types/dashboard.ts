import type { HorizontalCard } from "rn-vs-lb";

export type DashboardExperience = HorizontalCard & {
  description: string;
  tokenCost: number;
  generationPrompt: string;
  case: string;
};
