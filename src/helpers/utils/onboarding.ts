import { Image } from "react-native";

import { LANGUAGE_OPTIONS, normalizeLanguageCode } from "../../constants/languages";

type IllustrationKey = "welcome" | "memory" | "character" | "start";

type OnboardingIllustrationSet = Record<IllustrationKey, string>;

const ONBOARDING_ILLUSTRATIONS = {
  en: {
    welcome: require("../../assets/onboarding/onboarding1-en.png"),
    memory: require("../../assets/onboarding/onboarding2-en.png"),
    character: require("../../assets/onboarding/onboarding3-en.png"),
  },
  ru: {
    welcome: require("../../assets/onboarding/onboarding1-ru.png"),
    memory: require("../../assets/onboarding/onboarding2-ru.png"),
    character: require("../../assets/onboarding/onboarding3-ru.png"),
  },
  sr: {
    welcome: require("../../assets/onboarding/onboarding1-sr.png"),
    memory: require("../../assets/onboarding/onboarding2-sr.png"),
    character: require("../../assets/onboarding/onboarding3-sr.png"),
  },
  es: {
    welcome: require("../../assets/onboarding/onboarding1-es.png"),
    memory: require("../../assets/onboarding/onboarding2-es.png"),
    character: require("../../assets/onboarding/onboarding3-es.png"),
  },
  it: {
    welcome: require("../../assets/onboarding/onboarding1-it.png"),
    memory: require("../../assets/onboarding/onboarding2-it.png"),
    character: require("../../assets/onboarding/onboarding3-it.png"),
  },
  de: {
    welcome: require("../../assets/onboarding/onboarding1-de.png"),
    memory: require("../../assets/onboarding/onboarding2-de.png"),
    character: require("../../assets/onboarding/onboarding3-de.png"),
  },
  fr: {
    welcome: require("../../assets/onboarding/onboarding1-fr.png"),
    memory: require("../../assets/onboarding/onboarding2-fr.png"),
    character: require("../../assets/onboarding/onboarding3-fr.png"),
  },
  pt: {
    welcome: require("../../assets/onboarding/onboarding1-pt.png"),
    memory: require("../../assets/onboarding/onboarding2-pt.png"),
    character: require("../../assets/onboarding/onboarding3-pt.png"),
  },
} as const;

const START_ILLUSTRATION = require("../../assets/onboarding/onboarding4.gif");

const resolveUriSet = (assets: { welcome: number; memory: number; character: number }): OnboardingIllustrationSet => ({
  welcome: Image.resolveAssetSource(assets.welcome).uri,
  memory: Image.resolveAssetSource(assets.memory).uri,
  character: Image.resolveAssetSource(assets.character).uri,
  start: Image.resolveAssetSource(START_ILLUSTRATION).uri,
});

const ILLUSTRATIONS_BY_LANGUAGE: Record<string, OnboardingIllustrationSet> = Object.entries(ONBOARDING_ILLUSTRATIONS).reduce(
  (acc, [language, assets]) => ({
    ...acc,
    [language]: resolveUriSet(assets),
  }),
  {},
);

const DEFAULT_LANGUAGE = LANGUAGE_OPTIONS[0].code;

export const getOnboardingIllustrations = (language?: string): OnboardingIllustrationSet => {
  const normalizedLanguage = normalizeLanguageCode(language);
  return ILLUSTRATIONS_BY_LANGUAGE[normalizedLanguage ?? DEFAULT_LANGUAGE] ?? ILLUSTRATIONS_BY_LANGUAGE[DEFAULT_LANGUAGE];
};
