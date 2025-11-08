export interface LanguageOption {
  code: string;
  translationKey: string;
  fallbackLabel: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', translationKey: 'settings.component.language.languages.en', fallbackLabel: 'English' },
  { code: 'ru', translationKey: 'settings.component.language.languages.ru', fallbackLabel: 'Русский' },
  { code: 'sr', translationKey: 'settings.component.language.languages.sr', fallbackLabel: 'Srpski' },
  { code: 'es', translationKey: 'settings.component.language.languages.es', fallbackLabel: 'Español' },
  { code: 'it', translationKey: 'settings.component.language.languages.it', fallbackLabel: 'Italiano' },
  { code: 'de', translationKey: 'settings.component.language.languages.de', fallbackLabel: 'Deutsch' },
  { code: 'fr', translationKey: 'settings.component.language.languages.fr', fallbackLabel: 'Français' },
  { code: 'pt', translationKey: 'settings.component.language.languages.pt', fallbackLabel: 'Português' },
];

export const normalizeLanguageCode = (language?: string | null) => language?.split('-')[0];
