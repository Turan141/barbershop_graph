import React from "react"
import { AlertTriangle, Clock } from "lucide-react"
import { differenceInDays } from "date-fns"
import { Barber } from "../types"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

interface TrialBannerProps {
	barber: Barber
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ barber }) => {
	const { t } = useTranslation()

	if (barber.subscriptionStatus === "active") return null
	if (!barber.subscriptionEndDate) return null

	const endDate = new Date(barber.subscriptionEndDate)
	const daysLeft = differenceInDays(endDate, new Date())
	const isExpired = daysLeft < 0

	if (isExpired) {
		return (
			<div className='bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm'>
				<div className='flex items-start'>
					<div className='flex-shrink-0'>
						<AlertTriangle className='h-5 w-5 text-red-500' />
					</div>
					<div className='ml-3'>
						<h3 className='text-sm font-medium text-red-800'>
							{t("trial.expired_title")}
						</h3>
						<div className='mt-2 text-sm text-red-700'>
							<p>{t("trial.expired_desc")}</p>
							<Link
								to='/pricing'
								className='mt-3 inline-block bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors'
							>
								{t("trial.upgrade_btn")}
							</Link>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 rounded-r-lg shadow-sm'>
			<div className='flex items-start'>
				<div className='flex-shrink-0'>
					<Clock className='h-5 w-5 text-indigo-500' />
				</div>
				<div className='ml-3 flex-1'>
					<h3 className='text-sm font-medium text-indigo-800'>
						{t("trial.expiring_title")}
					</h3>
					<div className='mt-2 text-sm text-indigo-700'>
						<p>{t("trial.expiring_desc", { days: daysLeft })}</p>
					</div>
				</div>
			</div>
		</div>
	)
}
