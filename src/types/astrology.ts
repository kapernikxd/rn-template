export type HoroscopeCategory = 'general' | 'career' | 'love' | 'health' | 'family';

export type HoroscopeResponse = {
  category: HoroscopeCategory;
  horoscope: string;
};
