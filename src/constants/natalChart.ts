export type NatalReadingCardConfig = {
  key: string;
  title: string;
  accent: string;
};

export const NATAL_READING_CARDS: Omit<NatalReadingCardConfig, "title">[] = [
  { key: "energy", accent: "#8E7DFF" },
  { key: "personality", accent: "#FF8FB1" },
  { key: "emotions", accent: "#6DD3C2" },
  { key: "relationships", accent: "#F3B14C" },
  { key: "mind", accent: "#6EB5FF" },
  { key: "purpose", accent: "#C792EA" },
  { key: "career", accent: "#7ED957" },
  { key: "social", accent: "#FFA552" },
  { key: "inner", accent: "#A0AEC0" },
  { key: "shadow", accent: "#5E5CE6" },
];