import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Sparkles, BellRing, QrCode, ArrowRight, X } from "lucide-react"

interface BarberRoadmapProps {
	setActiveTab: (tab: any) => void
}

export const BarberRoadmap: React.FC<BarberRoadmapProps> = ({ setActiveTab }) => {
	const { t } = useTranslation()
	const [isVisible, setIsVisible] = useState(true)

	useEffect(() => {
		const isDismissed = localStorage.getItem("roadmap_dismissed")
		if (isDismissed === "true") {
			setIsVisible(false)
		}
	}, [])

	const handleDismiss = () => {
		localStorage.setItem("roadmap_dismissed", "true")
		setIsVisible(false)
	}

	if (!isVisible) return null

	const steps = [
		{
			id: "profile",
			icon: Sparkles,
			color: "bg-purple-100 text-purple-600",
			hover: "hover:bg-purple-50",
			title: t("dashboard.roadmap.step1_title", "Grow Your Client Base"),
			desc: t(
				"dashboard.roadmap.step1_desc",
				"Your profile is your digital business card. Add your best haircuts to the Portfolio, keep your services updated, and watch new clients roll in through our platform."
			),
			action: () => setActiveTab("profile"),
			btnText: t("dashboard.tabs.profile", "Profile")
		},
		{
			id: "notifications",
			icon: BellRing,
			color: "bg-blue-100 text-blue-600",
			hover: "hover:bg-blue-50",
			title: t("dashboard.roadmap.step2_title", "Never Miss a Booking"),
			desc: t(
				"dashboard.roadmap.step2_desc",
				"Don't let a client wait! Enable notifications (Web Push or Telegram) so you instantly know when someone books, cancels, or reschedules."
			),
			action: () => setActiveTab("notifications"),
			btnText: t("dashboard.tabs.notifications", "Notifications")
		},
		{
			id: "qrcode",
			icon: QrCode,
			color: "bg-emerald-100 text-emerald-600",
			hover: "hover:bg-emerald-50",
			title: t("dashboard.roadmap.step3_title", "The Magic QR Code"),
			desc: t(
				"dashboard.roadmap.step3_desc",
				"Print your unique QR Code from the QR tab and stick it on your mirror! Clients can simply scan it while sitting in your chair to see your portfolio, leave a review, or book their next visit on the spot."
			),
			action: () => setActiveTab("qrcode"),
			btnText: t("dashboard.tabs.qrcode", "QR Code")
		}
	]

	return (
		<div className='mt-8 mb-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden relative animate-fade-in'>
			{/* Decorative background elements */}
			<div className='absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl'></div>
			<div className='absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-primary-500 opacity-10 blur-3xl'></div>
			<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 opacity-50'></div>

			<div className='relative z-10'>
				<button
					onClick={handleDismiss}
					className='absolute -top-2 -right-2 sm:-top-6 sm:-right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md z-20'
					title={t("common.close", "Close")}
				>
					<X className='w-5 h-5' />
				</button>

				<div className='text-center mb-10'>
					<h2 className='text-2xl sm:text-4xl font-black text-white mb-4 tracking-tight drop-shadow-sm'>
						{t("dashboard.roadmap.title", "Your Success Roadmap")}
					</h2>
					<p className='text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed'>
						{t(
							"dashboard.roadmap.subtitle",
							"Maximize your potential as a professional barber with these easy steps."
						)}
					</p>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-6 relative'>
					{/* Connector line for desktop */}
					<div className='hidden lg:block absolute top-[44px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10'></div>

					{steps.map((step, idx) => (
						<div
							key={step.id}
							className='bg-white rounded-2xl p-6 sm:p-8 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group border border-slate-100 relative'
						>
							<div className='absolute -top-4 -left-4 w-12 h-12 bg-slate-900 text-white font-black rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10'>
								{idx + 1}
							</div>

							<div
								className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner mx-auto \${step.color}`}
							>
								<step.icon className='w-8 h-8' />
							</div>

							<h3 className='text-xl sm:text-2xl font-bold text-slate-900 mb-3 text-center'>
								{step.title}
							</h3>

							<p className='text-slate-500 text-sm sm:text-base leading-relaxed mb-8 flex-1 text-center'>
								{step.desc}
							</p>

							<button
								onClick={step.action}
								className={`mt-auto w-full flex items-center justify-center gap-2 py-3.5 px-4 font-bold rounded-xl transition-all duration-300 border shadow-sm \${step.color.replace('text-', 'border-').replace('bg-', 'bg-white border-').replace('100', '200')} \${step.hover} group-hover:scale-[1.02]`}
							>
								{step.btnText}
								<ArrowRight className='w-4 h-4 transition-transform group-hover:translate-x-1' />
							</button>
						</div>
					))}
				</div>

				<div className='mt-10 text-center'>
					<button
						onClick={handleDismiss}
						className='text-slate-400 hover:text-white text-sm font-medium transition-colors underline decoration-slate-400/30 underline-offset-4'
					>
						{t("dashboard.roadmap.dismiss", "Got it, hide this guide")}
					</button>
				</div>
			</div>
		</div>
	)
}
