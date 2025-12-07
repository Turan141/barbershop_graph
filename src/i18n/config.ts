import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import en from "./locales/en.json"
import az from "./locales/az.json"
import ru from "./locales/ru.json"

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			en: { translation: en },
			az: { translation: az },
			ru: { translation: ru }
		},
		fallbackLng: "az", // Default to Azerbaijani as per previous context
		interpolation: {
			escapeValue: false
		}
	})

export default i18n
