export type HoroscopeCategory = 'general' | 'career' | 'love' | 'health' | 'family';

export type HoroscopeResponse = {
  category: HoroscopeCategory;
  horoscope: string;
};

export type NatalChartBody = {
  key: string;
  label: string;
  sign: string;
  house: number;
  eclipticDegrees: number;
  arcDegreesFormatted?: string | null;
};

export type NatalChartHouse = {
  id: number;
  label: string;
  startDegrees: number;
  arcDegreesFormatted?: string | null;
};

export type NatalChartPayload = {
  bodies: NatalChartBody[];
  houses: NatalChartHouse[];
};

export type NatalReadingRequest = {
  chart: NatalChartPayload;
  theme: string;
};

export type NatalReadingResponse = {
  theme: string;
  reading: string;
};
