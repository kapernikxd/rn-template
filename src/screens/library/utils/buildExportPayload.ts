// src/screens/Library/utils/buildExportPayload.ts
import type { Horoscope } from 'circular-natal-horoscope-js';
import type { NatalChartPayload } from '../../../types/astrology';

const normalizeNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const normalizeString = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback;

const normalizeOptionalString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value : null;

export const buildExportPayload = (horoscope: Horoscope): NatalChartPayload => {
  const bodies = (horoscope.CelestialBodies?.all ?? []).map((body: any, index: number) => ({
    key: normalizeString(body?.key, `body-${index}`),
    label: normalizeString(body?.label ?? body?.name, `Тело ${index + 1}`),
    sign: normalizeString(body?.Sign?.label, 'Неизвестно'),
    house: normalizeNumber(body?.House?.id),
    eclipticDegrees: normalizeNumber(body?.ChartPosition?.Ecliptic?.DecimalDegrees),
    arcDegreesFormatted: normalizeOptionalString(
      body?.ChartPosition?.Ecliptic?.ArcDegreesFormatted30,
    ),
  }));

  const houses = (horoscope.Houses ?? []).map((house: any, index: number) => ({
    id: normalizeNumber(house?.id ?? index + 1),
    label: normalizeString(house?.Sign?.label ?? house?.label, `Дом ${index + 1}`),
    startDegrees: normalizeNumber(
      house?.ChartPosition?.StartPosition?.Ecliptic?.DecimalDegrees,
    ),
    arcDegreesFormatted: normalizeOptionalString(
      house?.ChartPosition?.StartPosition?.Ecliptic?.ArcDegreesFormatted30,
    ),
  }));

  return { bodies, houses };
};
