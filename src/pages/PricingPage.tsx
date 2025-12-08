import { Check } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

export const PricingPage = () => {
	const { t } = useTranslation()
	const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

	const handleSelectPlan = (plan: string) => {
		setSelectedPlan(plan)
	}

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='text-center mb-16'>
				<h1 className='text-4xl font-bold text-slate-900 mb-4'>
					{t("pages.pricing.title")}
				</h1>
				<p className='text-xl text-slate-600 max-w-2xl mx-auto'>
					{t("pages.pricing.subtitle")}
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto  pointer-events-none opacity-30'>
				{/* Basic Plan */}
				<div
					className={`card p-8 border transition-all cursor-pointer ${
						selectedPlan === "starter"
							? "border-primary-600 ring-2 ring-primary-600 ring-offset-2"
							: "border-slate-200 hover:border-primary-500"
					}`}
					onClick={() => handleSelectPlan("starter")}
				>
					<h3 className='text-xl font-semibold text-slate-900 mb-2'>
						{t("pages.pricing.starter.title")}
					</h3>
					<div className='text-4xl font-bold text-slate-900 mb-6'>
						{t("pages.pricing.starter.price")}
						<span className='text-lg font-normal text-slate-500'>
							/{t("pages.pricing.period")}
						</span>
					</div>
					<ul className='space-y-4 mb-8'>
						<li className='flex items-center gap-3 text-slate-600'>
							<Check className='h-5 w-5 text-green-500' />
							<span>{t("pages.pricing.starter.features.0")}</span>
						</li>
						<li className='flex items-center gap-3 text-slate-600'>
							<Check className='h-5 w-5 text-green-500' />
							<span>{t("pages.pricing.starter.features.1")}</span>
						</li>
						<li className='flex items-center gap-3 text-slate-600'>
							<Check className='h-5 w-5 text-green-500' />
							<span>{t("pages.pricing.starter.features.2")}</span>
						</li>
					</ul>
					<button
						className={`btn w-full ${
							selectedPlan === "starter" ? "btn-primary" : "btn-outline"
						}`}
					>
						{selectedPlan === "starter"
							? t("pages.pricing.selected")
							: t("pages.pricing.button")}
					</button>
				</div>

				{/* Pro Plan */}
				<div
					className={`card p-8 border-2 relative transform transition-all cursor-pointer ${
						selectedPlan === "pro"
							? "border-primary-600 ring-2 ring-primary-600 ring-offset-2 scale-105"
							: "border-primary-600 scale-105 shadow-xl"
					}`}
					onClick={() => handleSelectPlan("pro")}
				>
					<div className='absolute top-0 right-0 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl'>
						{t("pages.pricing.popular")}
					</div>
					<h3 className='text-xl font-semibold text-slate-900 mb-2'>
						{t("pages.pricing.pro.title")}
					</h3>
					<div className='text-4xl font-bold text-slate-900 mb-6'>
						{t("pages.pricing.pro.price")}
						<span className='text-lg font-normal text-slate-500'>
							/{t("pages.pricing.period")}
						</span>
					</div>
					<ul className='space-y-4 mb-8'>
						<li className='flex items-center gap-3 text-slate-600'>
							<Check className='h-5 w-5 text-green-500' />
							<span>{t("pages.pricing.pro.features.0")}</span>
						</li>
						<li className='flex items-center gap-3 text-slate-600'>
							<Check className='h-5 w-5 text-green-500' />
							<span>{t("pages.pricing.pro.features.1")}</span>
						</li>
						<li className='flex items-center gap-3 text-slate-600'>
							<Check className='h-5 w-5 text-green-500' />
							<span>{t("pages.pricing.pro.features.2")}</span>
						</li>
						<li className='flex items-center gap-3 text-slate-600'>
							<Check className='h-5 w-5 text-green-500' />
							<span>{t("pages.pricing.pro.features.3")}</span>
						</li>
					</ul>
					<button
						className={`btn w-full ${
							selectedPlan === "pro" ? "btn-primary" : "btn-primary"
						}`}
					>
						{selectedPlan === "pro"
							? t("pages.pricing.selected")
							: t("pages.pricing.button")}
					</button>
				</div>

				{/* Enterprise Plan */}
				<div
					className={`card p-8 border transition-all cursor-pointer ${
						selectedPlan === "enterprise"
							? "border-primary-600 ring-2 ring-primary-600 ring-offset-2"
							: "border-slate-200 hover:border-primary-500"
					}`}
					onClick={() => handleSelectPlan("enterprise")}
				>
					<h3 className='text-xl font-semibold text-slate-900 mb-2'>
						{t("pages.pricing.enterprise.title")}
					</h3>
					<div className='text-4xl font-bold text-slate-900 mb-6'>
						{t("pages.pricing.enterprise.price")}
						<span className='text-lg font-normal text-slate-500'>
							/{t("pages.pricing.period")}
						</span>
					</div>
					<ul className='space-y-4 mb-8'>
						<li className='flex items-center gap-3 text-slate-600'>
							<Check className='h-5 w-5 text-green-500' />
							<span>{t("pages.pricing.enterprise.features.0")}</span>
						</li>
						<li className='flex items-center gap-3 text-slate-600'>
							<Check className='h-5 w-5 text-green-500' />
							<span>{t("pages.pricing.enterprise.features.1")}</span>
						</li>
						<li className='flex items-center gap-3 text-slate-600'>
							<Check className='h-5 w-5 text-green-500' />
							<span>{t("pages.pricing.enterprise.features.2")}</span>
						</li>
						<li className='flex items-center gap-3 text-slate-600'>
							<Check className='h-5 w-5 text-green-500' />
							<span>{t("pages.pricing.enterprise.features.3")}</span>
						</li>
					</ul>
					<button
						className={`btn w-full ${
							selectedPlan === "enterprise" ? "btn-primary" : "btn-outline"
						}`}
					>
						{selectedPlan === "enterprise"
							? t("pages.pricing.selected")
							: t("pages.pricing.button")}
					</button>
				</div>
			</div>
		</div>
	)
}
