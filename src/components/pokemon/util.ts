import { InternationalName } from '@/api/schema';
import { Language } from '@/util';

export const getResourceName = (names: InternationalName[], locale: Language) => {
  const name = names.find((name) => name.language === locale);
  if (name?.name) {
    return name.name;
  }

  // Data gaps happen (e.g. a freshly generated move not yet localized into
  // every language) - fall back to English instead of leaking a raw debug
  // string into the UI, and warn so the gap gets caught during generation/QA.
  console.warn(`getResourceName: locale (${locale}) not present in names, falling back to "en"`);
  const fallback = names.find((name) => name.language === 'en');
  return fallback?.name;
};
