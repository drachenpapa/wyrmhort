import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import de from './locales/de/translation.json';
import en from './locales/en/translation.json';

i18n.use(initReactI18next).init({
    resources: {
        en: {translation: en},
        de: {translation: de}
    },
    lng: 'de',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false
    }
});
