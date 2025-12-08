import { Briefcase, Code, Megaphone, Heart } from "lucide-react"
import { useTranslation } from "react-i18next"

export const CareersPage = () => {
	const { t } = useTranslation()

	const positions = [
		{
			title: t("pages.careers.positions.0.title"),
			department: t("pages.careers.positions.0.department"),
			location: t("pages.careers.positions.0.location"),
			type: t("pages.careers.positions.0.type"),
			icon: Code
		},
		{
			title: t("pages.careers.positions.1.title"),
			department: t("pages.careers.positions.1.department"),
			location: t("pages.careers.positions.1.location"),
			type: t("pages.careers.positions.1.type"),
			icon: Heart
		},
		{
			title: t("pages.careers.positions.2.title"),
			department: t("pages.careers.positions.2.department"),
			location: t("pages.careers.positions.2.location"),
			type: t("pages.careers.positions.2.type"),
			icon: Megaphone
		},
		{
			title: t("pages.careers.positions.3.title"),
			department: t("pages.careers.positions.3.department"),
			location: t("pages.careers.positions.3.location"),
			type: t("pages.careers.positions.3.type"),
			icon: Briefcase
		}
	]

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='text-center mb-16'>
				<h1 className='text-4xl font-bold text-slate-900 mb-4'>
					{t("pages.careers.title")}
				</h1>
				<p className='text-xl text-slate-600 max-w-2xl mx-auto'>
					{t("pages.careers.subtitle")}
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto'>
				{positions.map((job, index) => (
					<div
						key={index}
						className='card p-6 hover:border-primary-500 transition-colors cursor-pointer group'
					>
						<div className='flex items-start justify-between'>
							<div className='flex gap-4'>
								<div className='w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors'>
									<job.icon className='h-6 w-6' />
								</div>
								<div>
									<h3 className='text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition-colors'>
										{job.title}
									</h3>
									<p className='text-slate-500 text-sm mb-2'>{job.department}</p>
									<div className='flex gap-3 text-xs font-medium text-slate-400'>
										<span className='bg-slate-100 px-2 py-1 rounded'>{job.location}</span>
										<span className='bg-slate-100 px-2 py-1 rounded'>{job.type}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
