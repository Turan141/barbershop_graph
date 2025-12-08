import { useTranslation } from "react-i18next"

export const TermsPage = () => {
	const { t } = useTranslation()

	return (
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<h1 className='text-3xl font-bold text-slate-900 mb-8'>{t("pages.terms.title")}</h1>
			<div className='prose prose-slate max-w-none'>
				<p className='text-slate-600 mb-6'>{t("pages.terms.last_updated")}</p>

				<h2 className='text-xl font-bold text-slate-900 mb-4'>
					{t("pages.terms.agreement.title")}
				</h2>
				<p className='text-slate-600 mb-6'>{t("pages.terms.agreement.content")}</p>

				<h2 className='text-xl font-bold text-slate-900 mb-4'>
					{t("pages.terms.license.title")}
				</h2>
				<p className='text-slate-600 mb-6'>{t("pages.terms.license.content")}</p>

				<h2 className='text-xl font-bold text-slate-900 mb-4'>
					{t("pages.terms.disclaimer.title")}
				</h2>
				<p className='text-slate-600 mb-6'>{t("pages.terms.disclaimer.content")}</p>

				<h2 className='text-xl font-bold text-slate-900 mb-4'>
					{t("pages.terms.limitations.title")}
				</h2>
				<p className='text-slate-600 mb-6'>{t("pages.terms.limitations.content")}</p>
			</div>
		</div>
	)
}
