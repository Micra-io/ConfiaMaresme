import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from '@/i18n/es.json';
import ca from '@/i18n/ca.json';
import en from '@/i18n/en.json';
import ru from '@/i18n/ru.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { es: { translation: es }, ca: { translation: ca }, en: { translation: en }, ru: { translation: ru } },
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
