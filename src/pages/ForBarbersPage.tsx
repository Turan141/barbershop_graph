import { TrendingUp, Users, Calendar } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

export const ForBarbersPage = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()

	const handleGetStarted = () => {
		navigate("/register", { state: { role: "barber" } })
	}

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='text-center mb-16'>
				<h1 className='text-4xl font-bold text-slate-900 mb-4'>
					{t("pages.for_barbers.title")}
				</h1>
				<p className='text-xl text-slate-600 max-w-2xl mx-auto'>
					{t("pages.for_barbers.subtitle")}
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
				<div className='card p-8 text-center'>
					<div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-6'>
						<Calendar className='h-8 w-8' />
					</div>
					<h3 className='text-xl font-semibold text-slate-900 mb-4'>
						{t("pages.for_barbers.scheduling.title")}
					</h3>
					<p className='text-slate-600'>{t("pages.for_barbers.scheduling.desc")}</p>
				</div>
				<div className='card p-8 text-center'>
					<div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-6'>
						<Users className='h-8 w-8' />
					</div>
					<h3 className='text-xl font-semibold text-slate-900 mb-4'>
						{t("pages.for_barbers.clients.title")}
					</h3>
					<p className='text-slate-600'>{t("pages.for_barbers.clients.desc")}</p>
				</div>
				<div className='card p-8 text-center'>
					<div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-6'>
						<TrendingUp className='h-8 w-8' />
					</div>
					<h3 className='text-xl font-semibold text-slate-900 mb-4'>
						{t("pages.for_barbers.growth.title")}
					</h3>
					<p className='text-slate-600'>{t("pages.for_barbers.growth.desc")}</p>
				</div>
			</div>

			<div className='bg-slate-900 rounded-3xl p-12 text-center text-white'>
				<h2 className='text-3xl font-bold mb-6'>{t("pages.for_barbers.cta.title")}</h2>
				<p className='text-slate-300 mb-8 max-w-2xl mx-auto'>
					{t("pages.for_barbers.cta.subtitle")}
				</p>
				<button
					onClick={handleGetStarted}
					className='btn bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 rounded-xl font-semibold'
				>
					{t("pages.for_barbers.cta.button")}
				</button>
			</div>
		</div>
	)
}
