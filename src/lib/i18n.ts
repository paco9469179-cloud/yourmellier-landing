import i18n from 'i18next'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

void i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: 'it',
    fallbackLng: 'en',
    supportedLngs: ['it', 'en', 'fr', 'de', 'es'],
    load: 'languageOnly',
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false,
    },
  })

export default i18n
