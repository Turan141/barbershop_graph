import React from "react"
import { AlertTriangle, Clock } from "lucide-react"
import { differenceInDays } from "date-fns"
import { Barber } from "../types"

interface TrialBannerProps {
	barber: Barber
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ barber }) => {
	if (barber.subscriptionStatus === "active") return null
	if (!barber.subscriptionEndDate) return null

	const endDate = new Date(barber.subscriptionEndDate)
	const daysLeft = differenceInDays(endDate, new Date())
	// const isExpired = daysLeft < 0

	// if (isExpired) {
	// 	return (
	// 		<div className='bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm'>
	// 			<div className='flex items-start'>
	// 				<div className='flex-shrink-0'>
	// 					<AlertTriangle className='h-5 w-5 text-red-500' />
	// 				</div>
	// 				<div className='ml-3'>
	// 					<h3 className='text-sm font-medium text-red-800'>Trial Period Expired</h3>
	// 					<div className='mt-2 text-sm text-red-700'>
	// 						<p>
	// 							Your 30-day trial period has ended. Your profile is currently hidden from
	// 							the public directory.
	// 						</p>
	// 						<p className='mt-2 font-medium'>
	// 							To reactivate your profile and continue getting bookings, please upgrade
	// 							your subscription.
	// 						</p>
	// 						<button className='mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors'>
	// 							Upgrade Now
	// 						</button>
	// 					</div>
	// 				</div>
	// 			</div>
	// 		</div>
	// 	)
	// }

	return (
		<div className='bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 rounded-r-lg shadow-sm'>
			<div className='flex items-start'>
				<div className='flex-shrink-0'>
					<Clock className='h-5 w-5 text-indigo-500' />
				</div>
				<div className='ml-3 flex-1'>
					<h3 className='text-sm font-medium text-indigo-800'>Trial Period Active</h3>
					<div className='mt-2 text-sm text-indigo-700'>
						<p>
							You have <strong>{daysLeft} days</strong> left in your free trial. Your
							profile is visible to all clients.
						</p>
						<p className='mt-1'>
							Make the most of it! Complete your profile and add photos to attract more
							clients.
						</p>
					</div>
				</div>
				<div className='ml-auto pl-3'>
					<div className='-mx-1.5 -my-1.5'>
						<button className='bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-indigo-200 transition-colors'>
							Upgrade Plan
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
