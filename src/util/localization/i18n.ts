import { texts } from './texts';

//https://datatracker.ietf.org/doc/html/rfc5646
export const Languages = ['de', 'en', 'es', 'fr', 'it', 'ja', 'ko'] as const;
export type Language = (typeof Languages)[number];
export const isSupportedLanguage = (language: string): language is Language =>
  Languages.includes(language as Language);

export type TextKey = keyof (typeof texts)[Language];

/**
 * Each language's own name for itself (endonym), independent of the currently
 * active UI language. Used for the language picker so options stay
 * recognizable regardless of which language is currently active - the
 * standard convention (see GitHub, YouTube, etc.), and avoids an N*N
 * translation matrix as more languages are added.
 */
export const languageNames: Record<Language, string> = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
};

/**
 * Reads the localized text of the given language and key.
 *
 * @param language - the language of the text
 * @param key - the key of the text
 *
 * @throws Error - thrown if language or key are unknown
 */
export const geti18nText = (language: Language, key: TextKey): string => {
  const languageTexts = texts[language];
  if (!languageTexts) {
    throw new Error(`access to localization with unknown language: ${language}`);
  }

  const text = languageTexts[key];
  if (!text) {
    throw new Error(`access to language texts ${language} with unknown key: ${key}`);
  }
  return text;
};

/**
 * Maps the given browser language to a supported game language key.
 * Will default to 'en'.
 *
 * @param browserLanguage - language tag according to [RFC 5646: Tags for Identifying Languages (also known as BCP 47)](https://datatracker.ietf.org/doc/html/rfc5646)
 */
export const getAppLanguage = (browserLanguage: string): Language => {
  const languageAbbreviation = browserLanguage.split('-')[0].toLowerCase();
  return isSupportedLanguage(languageAbbreviation) ? languageAbbreviation : 'en';
};

/**
 * Reads the users preferred language using navigator.language(s)
 *
 * @returns browserLanguage - language tag according to [RFC 5646: Tags for Identifying Languages (also known as BCP 47)](https://datatracker.ietf.org/doc/html/rfc5646)
 */
export const getBrowserLanguage = (): string => {
  if (navigator.languages) return navigator.languages[0];
  return navigator.language;
};
