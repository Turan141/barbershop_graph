import { useTranslation } from "react-i18next"
import { Check } from "lucide-react"

export const FeaturesPage = () => {
	const { t } = useTranslation()

	const features = [
		{
			title: t("pages.features.items.booking.title"),
			description: t("pages.features.items.booking.desc")
		},
		{
			title: t("pages.features.items.availability.title"),
			description: t("pages.features.items.availability.desc")
		},
		{
			title: t("pages.features.items.reminders.title"),
			description: t("pages.features.items.reminders.desc")
		},
		{
			title: t("pages.features.items.reviews.title"),
			description: t("pages.features.items.reviews.desc")
		}
	]

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='text-center mb-16'>
				<h1 className='text-4xl font-bold text-slate-900 mb-4'>
					{t("pages.features.title")}
				</h1>
				<p className='text-xl text-slate-600 max-w-2xl mx-auto'>
					{t("pages.features.subtitle")}
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
				{features.map((feature, index) => (
					<div key={index} className='flex gap-4'>
						<div className='flex-shrink-0'>
							<div className='w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600'>
								<Check className='h-6 w-6' />
							</div>
						</div>
						<div>
							<h3 className='text-xl font-semibold text-slate-900 mb-2'>
								{feature.title}
							</h3>
							<p className='text-slate-600'>{feature.description}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
