import { useTranslation } from "react-i18next"

export const AboutPage = () => {
	const { t } = useTranslation()

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='max-w-3xl mx-auto'>
				<h1 className='text-4xl font-bold text-slate-900 mb-8 text-center'>
					{t("pages.about.title")}
				</h1>

				<div className='prose prose-lg prose-slate mx-auto'>
					<p className='lead text-xl text-slate-600 mb-8'>{t("pages.about.subtitle")}</p>

					<h2 className='text-2xl font-bold text-slate-900 mb-4'>
						{t("pages.about.story.title")}
					</h2>
					<p className='text-slate-600 mb-6'>{t("pages.about.story.content")}</p>

					<h2 className='text-2xl font-bold text-slate-900 mb-4'>
						{t("pages.about.values.title")}
					</h2>
					<ul className='space-y-4 mb-8'>
						<li className='flex gap-3'>
							<span className='font-bold text-slate-900'>
								{t("pages.about.values.quality.title")}:
							</span>
							<span className='text-slate-600'>
								{t("pages.about.values.quality.desc")}
							</span>
						</li>
						<li className='flex gap-3'>
							<span className='font-bold text-slate-900'>
								{t("pages.about.values.community.title")}:
							</span>
							<span className='text-slate-600'>
								{t("pages.about.values.community.desc")}
							</span>
						</li>
						<li className='flex gap-3'>
							<span className='font-bold text-slate-900'>
								{t("pages.about.values.innovation.title")}:
							</span>
							<span className='text-slate-600'>
								{t("pages.about.values.innovation.desc")}
							</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	)
}
