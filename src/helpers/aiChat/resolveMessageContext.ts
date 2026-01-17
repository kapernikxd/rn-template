import { getStoredNatalFormState } from "../astrology/natalFormStorage";
import { getStoredNatalChart, getStoredPartnerNatalChart } from "../astrology/natalChartStorage";
import { getProfileInfo } from "../profile/profileInfoStorage";
import type { ChatMessageContext, RelationshipNatalChart } from "../../types/chat";

export type MessageContextWarning = "partnerNatalChartMissing";

const hasCategory = (categories: string[], target: string) =>
  categories.some((category) => category.toLowerCase() === target);

const formatBirthDate = (day: string, month: string, year: string): string | null => {
  if (!day.trim() || !month.trim() || !year.trim()) return null;
  const dayValue = day.padStart(2, "0");
  const monthValue = month.padStart(2, "0");
  return `${year}-${monthValue}-${dayValue}`;
};

const isContextEmpty = (context: ChatMessageContext) =>
  !context.birthDate &&
  !context.zodiacSign &&
  !context.natalChart &&
  !context.natalChartSignature &&
  !context.relationshipCharts?.length;

export const resolveMessageContextForCategories = async (
  categories: string[],
): Promise<{
  context: ChatMessageContext | null;
  warnings: MessageContextWarning[];
}> => {
  if (!categories.length) {
    return { context: null, warnings: [] };
  }

  const normalizedCategories = categories.map((category) => category.toLowerCase());
  const context: ChatMessageContext = {};
  const warnings: MessageContextWarning[] = [];

  if (hasCategory(normalizedCategories, "horoscope")) {
    const profileInfo = await getProfileInfo();
    if (profileInfo.zodiacSign) {
      context.zodiacSign = profileInfo.zodiacSign;
    }
  }

  if (hasCategory(normalizedCategories, "natal")) {
    const stored = await getStoredNatalChart();
    if (stored?.chart) {
      context.natalChart = stored.chart;
      context.natalChartSignature = stored.chartSignature;
    }
  }

  if (hasCategory(normalizedCategories, "relationships")) {
    const [myChart, partnerChart] = await Promise.all([
      getStoredNatalChart(),
      getStoredPartnerNatalChart(),
    ]);
    const relationshipCharts: RelationshipNatalChart[] = [];

    if (myChart?.chart) {
      relationshipCharts.push({
        role: "me",
        chart: myChart.chart,
        chartSignature: myChart.chartSignature,
      });
    }

    if (partnerChart?.chart) {
      relationshipCharts.push({
        role: "partner",
        chart: partnerChart.chart,
        chartSignature: partnerChart.chartSignature,
      });
    } else {
      warnings.push("partnerNatalChartMissing");
    }

    if (relationshipCharts.length) {
      context.relationshipCharts = relationshipCharts;
    }
  }

  if (hasCategory(normalizedCategories, "numerology")) {
    const storedFormState = await getStoredNatalFormState();
    const birthDate = storedFormState
      ? formatBirthDate(
          storedFormState.me.day,
          storedFormState.me.month,
          storedFormState.me.year,
        )
      : null;
    if (birthDate) {
      context.birthDate = birthDate;
    }
  }

  return { context: isContextEmpty(context) ? null : context, warnings };
};
