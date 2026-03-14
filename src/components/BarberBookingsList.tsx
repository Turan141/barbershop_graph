import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { api } from "../services/api"
import { Booking } from "../types"
import {
	Check,
	X,
	UserX,
	Calendar,
	MessageCircle,
	ChevronLeft,
	ChevronRight,
	Star,
	Clock,
	RefreshCw,
	Scissors
} from "lucide-react"
import clsx from "clsx"
import toast from "react-hot-toast"
import { format, isToday, isTomorrow, isYesterday } from "date-fns"
import { enUS, ru, az } from "date-fns/locale"

const locales: Record<string, any> = {
	en: enUS,
	ru: ru,
	az: az
}

interface BarberBookingsListProps {
	barberId: string
	refreshTrigger?: number
}

export const BarberBookingsList: React.FC<BarberBookingsListProps> = ({
	barberId,
	refreshTrigger = 0
}) => {
	const { t, i18n } = useTranslation()
	const currentLocale = locales[i18n.language] || enUS
	const [bookings, setBookings] = useState<Booking[]>([])
	const [loading, setLoading] = useState(true)
	const [processingId, setProcessingId] = useState<string | null>(null)
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [statusFilter, setStatusFilter] = useState<string>("all")
	const [showPastBookings, setShowPastBookings] = useState(false)
	const ITEMS_PER_PAGE = 20

	const fetchBookings = async (showLoading = true) => {
		if (showLoading) setLoading(true)
		try {
			const response = await api.bookings.listForBarber(barberId, {
				page,
				limit: ITEMS_PER_PAGE,
				status: statusFilter
			})
			if (response.data && Array.isArray(response.data)) {
				setBookings(response.data)
				setTotalPages(response.meta?.totalPages || 1)
			} else if (Array.isArray(response)) {
				setBookings(response)
				setTotalPages(1)
			}
		} catch (error) {
			console.error("Failed to fetch bookings", error)
			toast.error(t("dashboard.bookings.load_error") || "Failed to load bookings")
		} finally {
			if (showLoading) setLoading(false)
		}
	}

	useEffect(() => {
		fetchBookings(true)
	}, [barberId, page, statusFilter])

	useEffect(() => {
		if (refreshTrigger > 0) {
			fetchBookings(false)
		}
	}, [refreshTrigger])

	const handleStatusUpdate = async (
		bookingId: string,
		status: Booking["status"],
		comment?: string
	) => {
		setProcessingId(bookingId)
		try {
			await api.bookings.updateStatus(bookingId, status, comment)
			setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)))
			toast.success(t("dashboard.bookings.update_success") || "Booking updated")
		} catch (error) {
			console.error("Failed to update booking", error)
			toast.error(t("dashboard.bookings.update_error") || "Failed to update booking")
		} finally {
			setProcessingId(null)
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "confirmed":
				return "bg-green-100 text-green-700 hover:bg-green-200"
			case "pending":
				return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
			case "cancelled":
				return "bg-red-100 text-red-700 hover:bg-red-200"
			case "completed":
				return "bg-blue-100 text-blue-700 hover:bg-blue-200"
			case "no_show":
				return "bg-slate-200 text-slate-700 hover:bg-slate-300"
			default:
				return "bg-gray-100 text-gray-700"
		}
	}

	const formatGroupDate = (dateStr: string) => {
		try {
			const date = new Date(dateStr)
			if (isNaN(date.getTime())) return dateStr
			if (isToday(date))
				return (
					(t("common.today") || "Today") +
					`, ${format(date, "MMM d", { locale: currentLocale })}`
				)
			if (isTomorrow(date))
				return (
					(t("common.tomorrow") || "Tomorrow") +
					`, ${format(date, "MMM d", { locale: currentLocale })}`
				)
			if (isYesterday(date))
				return (
					(t("common.yesterday") || "Yesterday") +
					`, ${format(date, "MMM d", { locale: currentLocale })}`
				)
			return format(date, "EEEE, MMMM d", { locale: currentLocale })
		} catch {
			return dateStr
		}
	}

	if (loading) {
		return (
			<div className='flex justify-center items-center py-20'>
				<div className='relative w-12 h-12'>
					<div className='absolute inset-0 rounded-full border-t-2 border-primary-600 animate-spin'></div>
					<div className='absolute inset-2 rounded-full border-b-2 border-primary-400 animate-spin border-dashed'></div>
				</div>
			</div>
		)
	}

	const groupedBookings = bookings.reduce(
		(acc, booking) => {
			const key = booking.date
			if (!acc[key]) acc[key] = []
			acc[key].push(booking)
			return acc
		},
		{} as Record<string, Booking[]>
	)

	const todayStr = format(new Date(), "yyyy-MM-dd")
	const allDates = Object.keys(groupedBookings)
	const upcomingDates = allDates.filter((d) => d >= todayStr).sort()
	const pastDates = allDates
		.filter((d) => d < todayStr)
		.sort()
		.reverse()

	const filterTabs = [
		{ id: "all", label: t("common.all") || "All" },
		{ id: "pending", label: t("dashboard.bookings.status.pending") || "Pending" },
		{ id: "confirmed", label: t("dashboard.bookings.status.confirmed") || "Confirmed" },
		{ id: "completed", label: t("dashboard.bookings.status.completed") || "Completed" }
	]

	return (
		<div className='space-y-6'>
			{/* Header & Filters */}
			<div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm'>
				<div className='flex items-center gap-3'>
					<div className='p-2 bg-primary-50 rounded-xl text-primary-600'>
						<Calendar className='w-6 h-6' />
					</div>
					<div>
						<h2 className='text-xl font-black text-slate-900 tracking-tight leading-none'>
							{t("dashboard.bookings.title") || "Appointments Timeline"}
						</h2>
						<p className='text-sm text-slate-500 font-medium mt-1'>
							{t("dashboard.bookings.subtitle") || "Manage your daily schedule"}
						</p>
					</div>
				</div>

				<div className='flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto'>
					<div className='flex p-1 bg-slate-100 rounded-xl overflow-x-auto hide-scrollbar w-full sm:w-auto border border-slate-200'>
						{filterTabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => {
									setStatusFilter(tab.id)
									setPage(1)
								}}
								className={clsx(
									"flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-all duration-200",
									statusFilter === tab.id
										? "bg-white text-primary-700 shadow-sm ring-1 ring-slate-200/50"
										: "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
								)}
							>
								{tab.label}
							</button>
						))}
					</div>
					<button
						onClick={async () => {
							await fetchBookings(false)
							toast.success(t("common.refreshed") || "Refreshed")
						}}
						className='p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-100'
						title={t("common.refresh") || "Refresh"}
					>
						<RefreshCw className='w-5 h-5' />
					</button>
				</div>
			</div>

			{bookings.length === 0 ? (
				<div className='text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center shadow-sm'>
					<div className='w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4'>
						<Calendar className='w-10 h-10 text-slate-300' />
					</div>
					<h3 className='text-xl font-bold text-slate-900 mb-2'>
						{statusFilter === "all"
							? t("dashboard.bookings.no_bookings") || "Your schedule is clear"
							: t("dashboard.bookings.no_filtered_bookings") ||
								"No bookings found with this status"}
					</h3>
					<p className='text-slate-500 max-w-sm'>
						{statusFilter === "all"
							? t("dashboard.bookings.share_link") ||
								"Share your profile link to your clients to start seeing appointments here."
							: t("dashboard.bookings.try_different_filter") ||
								"Try changing the filter tabs above to find what you are looking for."}
					</p>
				</div>
			) : (
				<div className='space-y-10'>
					{upcomingDates.map((date) => (
						<div key={date} className='relative'>
							{/* Date Header */}
							<div className='sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md py-3 mb-4 border-y border-slate-200/50 -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:py-0'>
								<h3 className='text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2'>
									<div className='w-1.5 h-1.5 rounded-full bg-primary-500'></div>
									{formatGroupDate(date)}
								</h3>
							</div>

							{/* Bookings Timeline for this Date */}
							<div className='space-y-3 relative'>
								{/* Vertical Timeline line */}
								<div className='absolute left-[60px] sm:left-[80px] top-4 bottom-4 w-px bg-slate-200 hidden sm:block'></div>

								{groupedBookings[date].map((booking) => (
									<div
										key={booking.id}
										className='group relative bg-white sm:bg-transparent sm:hover:bg-white rounded-2xl sm:p-2 border border-slate-200 sm:border-transparent sm:hover:border-slate-200 sm:shadow-none shadow-sm sm:hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:items-center'
									>
										{/* Time Block (Left) */}
										<div className='flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center sm:w-[140px] sm:pr-6 shrink-0 bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-t-2xl sm:rounded-none border-b sm:border-b-0 border-slate-100'>
											<span className='text-2xl sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2'>
												<Clock className='w-5 h-5 sm:hidden text-slate-400' />
												{booking.time}
											</span>
											<span
												className={clsx(
													"px-3 py-1 sm:px-2 sm:py-0.5 rounded-full text-xs font-bold sm:mt-1 border border-transparent sm:border-current cursor-default transition-transform",
													getStatusColor(booking.status)
												)}
											>
												{t(`dashboard.bookings.status.${booking.status}`) ||
													booking.status}
											</span>
										</div>

										{/* Main Info (Middle) */}
										<div className='flex-1 px-4 sm:px-0 pb-2 sm:pb-0 z-10'>
											<div className='flex items-center gap-4'>
												<div className='w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-lg border-2 border-white shadow-sm shrink-0'>
													{booking.client?.name?.[0] || booking.guestName?.[0] || "G"}
												</div>
												<div className='min-w-0'>
													<h4 className='font-bold text-slate-900 text-[17px] flex items-center gap-2 truncate'>
														<span className='truncate'>
															{booking.client?.name || booking.guestName || "Guest"}
														</span>
														{(booking.client?.phone || booking.guestPhone) && (
															<a
																href={`https://wa.me/${(
																	booking.client?.phone ||
																	booking.guestPhone ||
																	""
																).replace(/\D/g, "")}`}
																target='_blank'
																rel='noopener noreferrer'
																className='text-[#25D366] hover:scale-110 active:scale-95 transition-all p-1.5 bg-[#25D366]/10 rounded-full shrink-0'
																title='WhatsApp'
																onClick={(e) => e.stopPropagation()}
															>
																<MessageCircle className='w-4 h-4' />
															</a>
														)}
													</h4>
													<div className='flex items-center gap-2 text-sm mt-1 text-slate-600 font-medium'>
														<Scissors className='w-4 h-4 text-primary-500' />
														<span className='truncate'>
															{booking.service?.name || "Service"}
														</span>
														<span className='text-slate-300'>•</span>
														<span className='whitespace-nowrap'>
															{booking.service?.duration} min
														</span>
													</div>
												</div>
											</div>
											{booking.client?.rating && (
												<div className='flex items-center gap-1 text-xs text-yellow-600 mt-2 ml-16'>
													<Star className='w-3.5 h-3.5 fill-current' />
													<span className='font-bold'>
														{booking.client.rating.toFixed(1)}
													</span>
													<span className='text-slate-400 font-medium'>
														({booking.client.reviewCount || 0} reviews)
													</span>
												</div>
											)}
										</div>

										{/* Price & Actions (Right) */}
										<div className='flex flex-row items-center justify-between sm:justify-end gap-4 px-4 pb-4 sm:p-0 sm:pl-4 sm:w-[220px] shrink-0'>
											<div className='text-left sm:text-right'>
												<div className='font-black text-lg text-slate-900 bg-slate-50 sm:bg-transparent px-3 py-1 sm:p-0 rounded-lg'>
													{booking.service?.price} {booking.service?.currency}
												</div>
											</div>

											{/* Quick Actions */}
											<div className='flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity'>
												{booking.status === "pending" && (
													<>
														<button
															onClick={() => handleStatusUpdate(booking.id, "confirmed")}
															disabled={processingId === booking.id}
															className='p-2.5 text-white bg-green-500 hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/20 active:scale-95 rounded-xl transition-all'
															title={t("dashboard.bookings.actions.confirm") || "Confirm"}
														>
															<Check className='w-5 h-5' />
														</button>
														<button
															onClick={() => handleStatusUpdate(booking.id, "cancelled")}
															disabled={processingId === booking.id}
															className='p-2.5 text-white bg-red-500 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 rounded-xl transition-all'
															title={t("dashboard.bookings.actions.cancel") || "Cancel"}
														>
															<X className='w-5 h-5' />
														</button>
													</>
												)}
												{booking.status === "confirmed" && (
													<>
														<button
															onClick={() => handleStatusUpdate(booking.id, "completed")}
															disabled={processingId === booking.id}
															className='p-2.5 text-white bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 rounded-xl transition-all'
															title={
																t("dashboard.bookings.actions.complete") || "Complete"
															}
														>
															<Check className='w-5 h-5' />
														</button>
														<button
															onClick={() => handleStatusUpdate(booking.id, "no_show")}
															disabled={processingId === booking.id}
															className='p-2.5 text-slate-600 bg-slate-200 hover:bg-slate-300 hover:shadow-lg hover:shadow-slate-500/20 active:scale-95 rounded-xl transition-all'
															title={t("dashboard.bookings.actions.no_show") || "No Show"}
														>
															<UserX className='w-5 h-5' />
														</button>
													</>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}

			{pastDates.length > 0 && (
				<div className='pt-8 mt-12 border-t border-slate-200'>
					<button
						onClick={() => setShowPastBookings(!showPastBookings)}
						className='w-full flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors font-medium border border-slate-200'
					>
						<Calendar className='w-5 h-5' />
						{showPastBookings
							? t("dashboard.hide_past", "Hide Past Appointments")
							: t("dashboard.show_past", "Show Past Appointments")}
					</button>

					{showPastBookings && (
						<div className='mt-8 space-y-10'>
							{pastDates.map((date) => (
								<div key={"past-" + date} className='relative opacity-75 grayscale-[0.3]'>
									<div className='sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md py-3 mb-4 border-y border-slate-200/50 -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:py-0'>
										<h3 className='text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2'>
											<div className='w-1.5 h-1.5 rounded-full bg-slate-400'></div>
											{formatGroupDate(date)}
										</h3>
									</div>
									<div className='space-y-3 relative'>
										<div className='absolute left-[60px] sm:left-[80px] top-4 bottom-4 w-px bg-slate-200 hidden sm:block'></div>
										{groupedBookings[date].map((booking) => (
											<div
												key={booking.id}
												className='group relative bg-white sm:bg-transparent sm:hover:bg-white rounded-2xl sm:p-2 border border-slate-200 sm:border-transparent sm:hover:border-slate-200 sm:shadow-none shadow-sm sm:hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:items-center'
											>
												<div className='flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center sm:w-[140px] sm:pr-6 shrink-0 bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-t-2xl sm:rounded-none border-b sm:border-b-0 border-slate-100'>
													<span className='text-2xl sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2'>
														<Clock className='w-5 h-5 sm:hidden text-slate-400' />
														{booking.time}
													</span>
													<span
														className={clsx(
															"px-3 py-1 sm:px-2 sm:py-0.5 rounded-full text-xs font-bold sm:mt-1 border border-transparent sm:border-current cursor-default transition-transform",
															getStatusColor(booking.status)
														)}
													>
														{t(`dashboard.bookings.status.${booking.status}`) ||
															booking.status}
													</span>
												</div>
												<div className='flex-1 p-4 pt-1 sm:p-0'>
													<div className='flex items-start justify-between gap-4'>
														<div className='flex items-center gap-3'>
															<div className='w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0'>
																{booking.client?.avatarUrl ? (
																	<img
																		src={booking.client?.avatarUrl}
																		alt={
																			booking.client?.name || booking.guestName || "Guest"
																		}
																		className='w-full h-full object-cover'
																	/>
																) : (
																	<div className='w-full h-full flex items-center justify-center text-slate-400 font-bold'>
																		{(
																			booking.client?.name ||
																			booking.guestName ||
																			"Guest"
																		).charAt(0)}
																	</div>
																)}
															</div>
															<div>
																<div className='font-bold text-slate-900 text-base flex items-center gap-2'>
																	{booking.client?.name || booking.guestName || "Guest"}
																</div>
																<div className='text-sm text-slate-500'>
																	{booking.service?.name || "Service"} •{" "}
																	{booking.service?.duration || 0}{" "}
																	{t("common.min") || "min"}
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className='flex justify-center items-center gap-4 pt-8 mt-8 border-t border-slate-100'>
					<button
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
						className='p-3 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm'
					>
						<ChevronLeft className='w-5 h-5 text-slate-600' />
					</button>
					<span className='px-4 py-2 font-bold text-slate-700 bg-slate-50 rounded-xl border border-slate-200'>
						{page} <span className='text-slate-400 font-medium mx-1'>/</span> {totalPages}
					</span>
					<button
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						disabled={page === totalPages}
						className='p-3 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm'
					>
						<ChevronRight className='w-5 h-5 text-slate-600' />
					</button>
				</div>
			)}
		</div>
	)
}
