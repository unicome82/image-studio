import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import ko from './locales/ko';

export const languageKey = 'image-studio-language';
function initialLanguage() {
  try {
    const saved = localStorage.getItem(languageKey);
    if (saved === 'en' || saved === 'ko') return saved;
  } catch {
    // Language switching remains available when browser storage is disabled.
  }
  return navigator.language.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}
function syncLanguage(language: string) {
  document.documentElement.lang = language;
  document.title = i18n.t('Image Studio — A space for visual ideas');
  try {
    localStorage.setItem(languageKey, language);
  } catch {
    // Keep the selected language for this visit.
  }
}
void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ko: { translation: ko } },
  lng: initialLanguage(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'ko'],
  keySeparator: false,
  nsSeparator: false,
  initAsync: false,
  interpolation: { escapeValue: false },
});
syncLanguage(i18n.resolvedLanguage ?? 'en');
i18n.on('languageChanged', syncLanguage);
export default i18n;
