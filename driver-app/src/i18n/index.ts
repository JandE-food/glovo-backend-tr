import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import albanian from '../../translations/albanian.json';
import english from '../../translations/english.json';
import serbian from '../../translations/serbian.json';

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'sq',
  fallbackLng: 'en',
  resources: {
    sq: {
      translation: albanian
    },
    en: {
      translation: english
    },
    sr: {
      translation: serbian
    }
  },
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
