import { Check } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { api } from "@/services/api"
import { useAuthStore } from "@/store/authStore"
import { useNavigate } from "react-router-dom"

export const PricingPage = () => {
	const { t } = useTranslation()
	const { user } = useAuthStore()
	const navigate = useNavigate()
	const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const handleContact = async (plan: string) => {
		if (plan === "demo") {
			if (!user) {
				navigate("/register")
				return
			}
			setLoading(true)
			try {
				await api.barbers.activateTrial()
				navigate("/dashboard")
			} catch (error) {
				console.error("Failed to activate trial", error)
				alert("Failed to activate trial. Please try again or contact support.")
			} finally {
				setLoading(false)
			}
			return
		}

		let planName = ""
		if (plan === "basic") planName = "Basic"
		if (plan === "standard") planName = "Standard"
		if (plan === "pro") planName = "Pro"

		const message = `Salam, mən ${planName} paketinə qoşulmaq istəyirəm.`
		const phoneNumber = "994557920550" // move to constants file later
		const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
		window.open(url, "_blank")
	}

	const demoFeatures = t("pages.pricing.demo.features", {
		returnObjects: true
	}) as string[]
	const basicFeatures = t("pages.pricing.basic.features", {
		returnObjects: true
	}) as string[]
	const standardFeatures = t("pages.pricing.standard.features", {
		returnObjects: true
	}) as string[]
	const proFeatures = t("pages.pricing.pro.features", {
		returnObjects: true
	}) as string[]

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

			{/* Demo Plan - Highlighted */}
			<div className='max-w-6xl mx-auto mb-12'>
				<div
					className={`card p-8 border-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
						selectedPlan === "demo" ? "ring-2 ring-indigo-500 ring-offset-2" : ""
					}`}
					onClick={() => setSelectedPlan("demo")}
				>
					<div className='flex flex-col md:flex-row items-center justify-between gap-6'>
						<div className='flex-1 text-center md:text-left'>
							<div className='inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2'>
								{t("pages.pricing.demo.price")}
							</div>
							<h3 className='text-2xl font-bold text-slate-900 mb-2'>
								{t("pages.pricing.demo.title")}
							</h3>
							<p className='text-slate-600 mb-4 md:mb-0'>
								{t("pages.pricing.demo.description")}
							</p>
						</div>
						<div className='flex-1'>
							<ul className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
								{Array.isArray(demoFeatures) &&
									demoFeatures.map((feature, index) => (
										<li key={index} className='flex items-center gap-2 text-slate-700'>
											<Check className='h-5 w-5 text-green-500 flex-shrink-0' />
											<span className='text-sm font-medium'>{feature}</span>
										</li>
									))}
							</ul>
						</div>
						<div>
							<button
								onClick={(e) => {
									e.stopPropagation()
									handleContact("demo")
								}}
								disabled={loading}
								className={`w-full md:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 ${
									loading ? "opacity-50 cursor-not-allowed" : ""
								}`}
							>
								{loading ? "..." : t("pages.pricing.demo.button")}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Paid Plans Grid */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto'>
				{/* Basic Plan */}
				<div
					className={`card p-6 border transition-all cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-md flex flex-col ${
						selectedPlan === "basic"
							? "border-primary-600 ring-2 ring-primary-600 ring-offset-2"
							: "border-slate-200 hover:border-primary-500"
					}`}
					onClick={() => setSelectedPlan("basic")}
				>
					<h3 className='text-xl font-semibold text-slate-900 mb-2'>
						{t("pages.pricing.basic.title")}
					</h3>
					<div className='text-3xl font-bold text-slate-900 mb-4'>
						{t("pages.pricing.basic.price")}
						<span className='text-base font-normal text-slate-500 ml-1'>
							/{t("pages.pricing.period")}
						</span>
					</div>
					<p className='text-sm text-slate-500 mb-6 min-h-[40px]'>
						{t("pages.pricing.basic.description")}
					</p>
					<ul className='space-y-3 mb-8 flex-grow'>
						{Array.isArray(basicFeatures) &&
							basicFeatures.map((feature, index) => (
								<li key={index} className='flex items-start gap-3 text-slate-600'>
									<Check className='h-5 w-5 text-green-500 flex-shrink-0 mt-0.5' />
									<span className='text-sm'>{feature}</span>
								</li>
							))}
					</ul>
					<button
						onClick={(e) => {
							e.stopPropagation()
							handleContact("basic")
						}}
						className={`w-full py-2.5 px-4 rounded-xl font-bold transition-colors ${
							selectedPlan === "basic"
								? "bg-primary-600 text-white hover:bg-primary-700"
								: "bg-slate-100 text-slate-900 hover:bg-slate-200"
						}`}
					>
						{t("pages.pricing.basic.button")}
					</button>
				</div>

				{/* Standard Plan */}
				<div
					className={`card p-6 border-2 relative transform transition-all cursor-pointer bg-white rounded-2xl shadow-xl flex flex-col ${
						selectedPlan === "standard"
							? "border-primary-600 ring-2 ring-primary-600 ring-offset-2 scale-105 z-10"
							: "border-primary-600 scale-105 z-10"
					}`}
					onClick={() => setSelectedPlan("standard")}
				>
					<div className='absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider'>
						{t("pages.pricing.popular")}
					</div>
					<h3 className='text-xl font-semibold text-slate-900 mb-2'>
						{t("pages.pricing.standard.title")}
					</h3>
					<div className='text-3xl font-bold text-slate-900 mb-4'>
						{t("pages.pricing.standard.price")}
						<span className='text-base font-normal text-slate-500 ml-1'>
							/{t("pages.pricing.period")}
						</span>
					</div>
					<p className='text-sm text-slate-500 mb-6 min-h-[40px]'>
						{t("pages.pricing.standard.description")}
					</p>
					<ul className='space-y-3 mb-8 flex-grow'>
						{Array.isArray(standardFeatures) &&
							standardFeatures.map((feature, index) => (
								<li key={index} className='flex items-start gap-3 text-slate-600'>
									<Check className='h-5 w-5 text-green-500 flex-shrink-0 mt-0.5' />
									<span className='text-sm'>{feature}</span>
								</li>
							))}
					</ul>
					<button
						onClick={(e) => {
							e.stopPropagation()
							handleContact("standard")
						}}
						className='w-full py-2.5 px-4 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20'
					>
						{t("pages.pricing.standard.button")}
					</button>
				</div>

				{/* Pro Plan */}
				<div
					className={`card p-6 border transition-all cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-md flex flex-col ${
						selectedPlan === "pro"
							? "border-primary-600 ring-2 ring-primary-600 ring-offset-2"
							: "border-slate-200 hover:border-primary-500"
					}`}
					onClick={() => setSelectedPlan("pro")}
				>
					<h3 className='text-xl font-semibold text-slate-900 mb-2'>
						{t("pages.pricing.pro.title")}
					</h3>
					<div className='text-3xl font-bold text-slate-900 mb-4'>
						{t("pages.pricing.pro.price")}
						<span className='text-base font-normal text-slate-500 ml-1'>
							/{t("pages.pricing.period")}
						</span>
					</div>
					<p className='text-sm text-slate-500 mb-6 min-h-[40px]'>
						{t("pages.pricing.pro.description")}
					</p>
					<ul className='space-y-3 mb-8 flex-grow'>
						{Array.isArray(proFeatures) &&
							proFeatures.map((feature, index) => (
								<li key={index} className='flex items-start gap-3 text-slate-600'>
									<Check className='h-5 w-5 text-green-500 flex-shrink-0 mt-0.5' />
									<span className='text-sm'>{feature}</span>
								</li>
							))}
					</ul>
					<button
						onClick={(e) => {
							e.stopPropagation()
							handleContact("pro")
						}}
						className={`w-full py-2.5 px-4 rounded-xl font-bold transition-colors ${
							selectedPlan === "pro"
								? "bg-primary-600 text-white hover:bg-primary-700"
								: "bg-slate-100 text-slate-900 hover:bg-slate-200"
						}`}
					>
						{t("pages.pricing.pro.button")}
					</button>
				</div>
			</div>
		</div>
	)
}
