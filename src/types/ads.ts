export type AdSource = "google" | "yandex";

export const resolveAdSource = (source?: string | null): AdSource =>
  source?.toLowerCase() === "yandex" ? "yandex" : "google";
