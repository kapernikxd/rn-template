export interface ZodiacOption {
  value: string;
  translationKey: string;
  fallbackLabel: string;
}

export const ZODIAC_OPTIONS: ZodiacOption[] = [
  { value: 'aries', translationKey: 'common.zodiac.aries', fallbackLabel: 'Aries' },
  { value: 'taurus', translationKey: 'common.zodiac.taurus', fallbackLabel: 'Taurus' },
  { value: 'gemini', translationKey: 'common.zodiac.gemini', fallbackLabel: 'Gemini' },
  { value: 'cancer', translationKey: 'common.zodiac.cancer', fallbackLabel: 'Cancer' },
  { value: 'leo', translationKey: 'common.zodiac.leo', fallbackLabel: 'Leo' },
  { value: 'virgo', translationKey: 'common.zodiac.virgo', fallbackLabel: 'Virgo' },
  { value: 'libra', translationKey: 'common.zodiac.libra', fallbackLabel: 'Libra' },
  { value: 'scorpio', translationKey: 'common.zodiac.scorpio', fallbackLabel: 'Scorpio' },
  { value: 'sagittarius', translationKey: 'common.zodiac.sagittarius', fallbackLabel: 'Sagittarius' },
  { value: 'capricorn', translationKey: 'common.zodiac.capricorn', fallbackLabel: 'Capricorn' },
  { value: 'aquarius', translationKey: 'common.zodiac.aquarius', fallbackLabel: 'Aquarius' },
  { value: 'pisces', translationKey: 'common.zodiac.pisces', fallbackLabel: 'Pisces' },
];
