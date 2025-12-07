import { useTranslation } from "react-i18next"
import clsx from "clsx"

export const LanguageSwitcher = () => {
	const { i18n } = useTranslation()

	const languages = [
		{ code: "en", label: "EN" },
		{ code: "az", label: "AZ" },
		{ code: "ru", label: "RU" }
	]

	return (
		<div className='flex items-center gap-2 bg-slate-100 rounded-lg p-1'>
			{languages.map((lang) => (
				<button
					key={lang.code}
					onClick={() => i18n.changeLanguage(lang.code)}
					className={clsx(
						"px-2 py-1 text-xs font-bold rounded-md transition-colors",
						i18n.language === lang.code
							? "bg-white text-primary-600 shadow-sm"
							: "text-slate-500 hover:text-slate-900"
					)}
				>
					{lang.label}
				</button>
			))}
		</div>
	)
}
