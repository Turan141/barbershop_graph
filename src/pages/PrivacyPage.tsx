import { useTranslation } from "react-i18next"

export const PrivacyPage = () => {
	const { t } = useTranslation()

	return (
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<h1 className='text-3xl font-bold text-slate-900 mb-8'>
				{t("pages.privacy.title")}
			</h1>
			<div className='prose prose-slate max-w-none'>
				<p className='text-slate-600 mb-6'>{t("pages.privacy.last_updated")}</p>

				<h2 className='text-xl font-bold text-slate-900 mb-4'>
					{t("pages.privacy.intro.title")}
				</h2>
				<p className='text-slate-600 mb-6'>{t("pages.privacy.intro.content")}</p>

				<h2 className='text-xl font-bold text-slate-900 mb-4'>
					{t("pages.privacy.data.title")}
				</h2>
				<p className='text-slate-600 mb-6'>{t("pages.privacy.data.content")}</p>
				<ul className='list-disc pl-6 text-slate-600 mb-6 space-y-2'>
					<li>{t("pages.privacy.data.list.0")}</li>
					<li>{t("pages.privacy.data.list.1")}</li>
					<li>{t("pages.privacy.data.list.2")}</li>
					<li>{t("pages.privacy.data.list.3")}</li>
				</ul>

				<h2 className='text-xl font-bold text-slate-900 mb-4'>
					{t("pages.privacy.usage.title")}
				</h2>
				<p className='text-slate-600 mb-6'>{t("pages.privacy.usage.content")}</p>
				<ul className='list-disc pl-6 text-slate-600 mb-6 space-y-2'>
					<li>{t("pages.privacy.usage.list.0")}</li>
					<li>{t("pages.privacy.usage.list.1")}</li>
					<li>{t("pages.privacy.usage.list.2")}</li>
				</ul>
			</div>
		</div>
	)
}
