// src/screens/Library/utils/makeSummaryText.ts
export const makeSummaryText = (p: { day: string; month: string; year: string; time: string; city: string }) => {
  const parts: string[] = [];
  const d = p.day.trim();
  const m = p.month.trim();
  const y = p.year.trim();
  const t = p.time.trim();
  const c = p.city.trim();

  if (d && m && y) parts.push(`${d}.${m}.${y}`);
  if (t) parts.push(t);
  if (c) parts.push(c);

  if (parts.length === 0) return "Заполните данные для расчёта натальной карты";
  return parts.join(" · ");
};
