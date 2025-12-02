// src/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import en from "./locales/en.json";
import ru from "./locales/ru.json";
import sr from "./locales/sr.json";
import es from "./locales/es.json";
import it from "./locales/it.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import pt from "./locales/pt.json";

const deviceLangTag = Localization.getLocales()[0]?.languageTag ?? "en"; // напр., 'sr-Latn-RS' или 'ru-RU'

i18n
  .use(initReactI18next)
  .init({
    // берём полный тег устройства, но загружаем только язык (без региона/скрипта)
    lng: deviceLangTag,
    load: "languageOnly", // 'sr-Latn-RS' -> 'sr'
    fallbackLng: "en",
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      sr: { translation: sr },
      es: { translation: es },
      it: { translation: it },
      de: { translation: de },
      fr: { translation: fr },
      pt: { translation: pt },
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
