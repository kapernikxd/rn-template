// src/screens/Library/utils/buildExportPayload.ts
import type { Horoscope } from "circular-natal-horoscope-js";

export const buildExportPayload = (horoscope: Horoscope) => {
  const bodies = (horoscope.CelestialBodies?.all ?? []).map((body:any) => ({
    key: body.key,
    label: body.label,
    sign: body?.Sign?.label ?? null,
    house: body?.House?.id ?? null,
    eclipticDegrees: body?.ChartPosition?.Ecliptic?.DecimalDegrees ?? null,
    arcDegreesFormatted: body?.ChartPosition?.Ecliptic?.ArcDegreesFormatted30 ?? null,
  }));

  const houses = (horoscope.Houses ?? []).map((house:any) => ({
    id: house.id,
    label: house?.Sign?.label ?? house?.label ?? `Дом ${house.id}`,
    startDegrees: house?.ChartPosition?.StartPosition?.Ecliptic?.DecimalDegrees ?? null,
    arcDegreesFormatted: house?.ChartPosition?.StartPosition?.Ecliptic?.ArcDegreesFormatted30 ?? null,
  }));

  return { bodies, houses };
};
