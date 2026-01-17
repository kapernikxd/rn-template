import type { NatalChartPayload } from "../astrology";

export type RelationshipChartRole = "me" | "partner";

export type RelationshipNatalChart = {
  role: RelationshipChartRole;
  chart: NatalChartPayload;
  chartSignature?: string;
};

export type ChatMessageContext = {
  zodiacSign?: string;
  birthDate?: string;
  natalChart?: NatalChartPayload;
  natalChartSignature?: string;
  relationshipCharts?: RelationshipNatalChart[];
};
