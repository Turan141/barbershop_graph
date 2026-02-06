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
	ChevronRight
} from "lucide-react"
import clsx from "clsx"
import toast from "react-hot-toast"

interface BarberBookingsListProps {
	barberId: string
	refreshTrigger?: number
}

export const BarberBookingsList: React.FC<BarberBookingsListProps> = ({
	barberId,
	refreshTrigger = 0
}) => {
	const { t } = useTranslation()
	const [bookings, setBookings] = useState<Booking[]>([])
	const [loading, setLoading] = useState(true)
	const [processingId, setProcessingId] = useState<string | null>(null)
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [statusFilter, setStatusFilter] = useState<string>("all")
	const ITEMS_PER_PAGE = 20

	const fetchBookings = async (showLoading = true) => {
		if (showLoading) setLoading(true)
		try {
			const response = await api.bookings.listForBarber(barberId, {
				page,
				limit: ITEMS_PER_PAGE,
				status: statusFilter
			})
			// Handle both paginated and non-paginated responses (for backward compatibility)
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
				return "bg-green-100 text-green-700 border-green-200"
			case "pending":
				return "bg-yellow-100 text-yellow-700 border-yellow-200"
			case "cancelled":
				return "bg-red-100 text-red-700 border-red-200"
			case "completed":
				return "bg-blue-100 text-blue-700 border-blue-200"
			case "no_show":
				return "bg-slate-100 text-slate-700 border-slate-200"
			default:
				return "bg-gray-100 text-gray-700 border-gray-200"
		}
	}

	if (loading) {
		return (
			<div className='flex justify-center py-12'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600'></div>
			</div>
		)
	}

	return (
		<div className='space-y-4'>
			<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4'>
				<h2 className='text-xl font-bold text-slate-900'>
					{t("dashboard.bookings.title") || "Bookings"}
				</h2>
				<div className='flex items-center gap-3 w-full sm:w-auto'>
					<select
						value={statusFilter}
						onChange={(e) => {
							setStatusFilter(e.target.value)
							setPage(1)
						}}
						className='text-sm border-slate-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 flex-1 sm:flex-none'
					>
						<option value='all'>{t("common.all") || "All Statuses"}</option>
						<option value='pending'>
							{t("dashboard.bookings.status.pending") || "Pending"}
						</option>
						<option value='confirmed'>
							{t("dashboard.bookings.status.confirmed") || "Confirmed"}
						</option>
						<option value='completed'>
							{t("dashboard.bookings.status.completed") || "Completed"}
						</option>
						<option value='cancelled'>
							{t("dashboard.bookings.status.cancelled") || "Cancelled"}
						</option>
						<option value='no_show'>
							{t("dashboard.bookings.status.no_show") || "No Show"}
						</option>
					</select>
					<button
						onClick={fetchBookings}
						className='text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap'
					>
						{t("common.refresh") || "Refresh"}
					</button>
				</div>
			</div>

			{bookings.length === 0 ? (
				<div className='text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200'>
					<Calendar className='w-12 h-12 text-slate-300 mx-auto mb-3' />
					<h3 className='text-lg font-medium text-slate-900'>
						{statusFilter === "all"
							? t("dashboard.bookings.no_bookings") || "No bookings yet"
							: t("dashboard.bookings.no_filtered_bookings") ||
								"No bookings found with this status"}
					</h3>
					<p className='text-slate-500'>
						{statusFilter === "all"
							? t("dashboard.bookings.share_link") ||
								"Share your profile link to get bookings."
							: t("dashboard.bookings.try_different_filter") ||
								"Try selecting a different status."}
					</p>
				</div>
			) : (
				<>
					{/* Desktop Table View */}
					<div className='hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden'>
						<div className='overflow-x-auto'>
							<table className='w-full text-left text-sm'>
								<thead className='bg-slate-50 border-b border-slate-100'>
									<tr>
										<th className='px-6 py-4 font-semibold text-slate-700'>
											{t("dashboard.bookings.client") || "Client"}
										</th>
										<th className='px-6 py-4 font-semibold text-slate-700'>
											{t("dashboard.bookings.service") || "Service"}
										</th>
										<th className='px-6 py-4 font-semibold text-slate-700'>
											{t("dashboard.bookings.date_time") || "Date & Time"}
										</th>
										<th className='px-6 py-4 font-semibold text-slate-700'>
											{t("dashboard.bookings.status_label") || "Status"}
										</th>
										<th className='px-6 py-4 font-semibold text-slate-700 text-right'>
											{t("dashboard.bookings.actions_label") || "Actions"}
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-slate-100'>
									{bookings.map((booking) => (
										<tr key={booking.id} className='hover:bg-slate-50 transition-colors'>
											<td className='px-6 py-4'>
												<div className='flex items-center gap-3'>
													<div className='w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs'>
														{booking.client?.name?.[0] || "U"}
													</div>
													<div>
														<div className='font-medium text-slate-900 flex items-center gap-2'>
															{booking.guestName ||
																booking.client?.name ||
																t("dashboard.bookings.unknown_client")}
															{(booking.guestPhone || booking.client?.phone) && (
																<a
																	href={`https://wa.me/${(
																		booking.guestPhone ||
																		booking.client?.phone ||
																		""
																	).replace(/\D/g, "")}`}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='text-green-500 hover:text-green-600 transition-colors'
																	title='WhatsApp'
																	onClick={(e) => e.stopPropagation()}
																>
																	<MessageCircle className='w-4 h-4' />
																</a>
															)}
														</div>
														{booking.client?.email && (
															<div className='text-xs text-slate-500'>
																{booking.client.email}
															</div>
														)}
														{booking.guestPhone && (
															<div className='text-xs text-slate-500'>
																{booking.guestPhone}
															</div>
														)}
													</div>
												</div>
											</td>
											<td className='px-6 py-4'>
												<div className='font-medium text-slate-900'>
													{booking.service?.name ||
														t("dashboard.bookings.unknown_service")}
												</div>
												<div className='text-xs text-slate-500'>
													{booking.service?.duration} min • {booking.service?.price}{" "}
													{booking.service?.currency}
												</div>
											</td>
											<td className='px-6 py-4'>
												<div className='flex flex-col'>
													<span className='font-medium text-slate-900'>
														{booking.time}
													</span>
													<span className='text-xs text-slate-500'>{booking.date}</span>
												</div>
											</td>
											<td className='px-6 py-4'>
												<span
													className={clsx(
														"px-2.5 py-1 rounded-full text-xs font-medium border",
														getStatusColor(booking.status)
													)}
												>
													{t(`dashboard.bookings.status.${booking.status}`) ||
														booking.status}
												</span>
											</td>
											<td className='px-6 py-4 text-right'>
												<div className='flex items-center justify-end gap-2'>
													{booking.status === "pending" && (
														<>
															<button
																onClick={() =>
																	handleStatusUpdate(booking.id, "confirmed")
																}
																disabled={processingId === booking.id}
																className='p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors'
																title={
																	t("dashboard.bookings.actions.confirm") || "Confirm"
																}
															>
																<Check className='w-4 h-4' />
															</button>
															<button
																onClick={() =>
																	handleStatusUpdate(booking.id, "cancelled")
																}
																disabled={processingId === booking.id}
																className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
																title={t("dashboard.bookings.actions.cancel") || "Cancel"}
															>
																<X className='w-4 h-4' />
															</button>
														</>
													)}
													{booking.status === "confirmed" && (
														<>
															<button
																onClick={() =>
																	handleStatusUpdate(booking.id, "completed")
																}
																disabled={processingId === booking.id}
																className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
																title={
																	t("dashboard.bookings.actions.complete") || "Complete"
																}
															>
																<Check className='w-4 h-4' />
															</button>
															<button
																onClick={() => handleStatusUpdate(booking.id, "no_show")}
																disabled={processingId === booking.id}
																className='p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors'
																title={
																	t("dashboard.bookings.actions.no_show") || "No Show"
																}
															>
																<UserX className='w-4 h-4' />
															</button>
														</>
													)}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Mobile Card View */}
					<div className='sm:hidden space-y-4'>
						{bookings.map((booking) => (
							<div
								key={booking.id}
								className='bg-white p-4 rounded-xl border border-slate-200 shadow-sm'
							>
								<div className='flex justify-between items-start mb-3'>
									<div className='flex items-center gap-3'>
										<div className='w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold'>
											{booking.client?.name?.[0] || "U"}
										</div>
										<div>
											<div className='font-bold text-slate-900 flex items-center gap-2'>
												{booking.client?.name ||
													booking.guestName ||
													t("dashboard.bookings.unknown_client")}
												{(booking.client?.phone || booking.guestPhone) && (
													<a
														href={`https://wa.me/${(
															booking.client?.phone ||
															booking.guestPhone ||
															""
														).replace(/\D/g, "")}`}
														target='_blank'
														rel='noopener noreferrer'
														className='text-green-500 hover:text-green-600 transition-colors'
														title='WhatsApp'
														onClick={(e) => e.stopPropagation()}
													>
														<MessageCircle className='w-4 h-4' />
													</a>
												)}
											</div>
											<div className='text-xs text-slate-500'>
												{booking.date} • {booking.time}
											</div>
										</div>
									</div>
									<span
										className={clsx(
											"px-2 py-1 rounded-lg text-xs font-bold border",
											getStatusColor(booking.status)
										)}
									>
										{t(`dashboard.bookings.status.${booking.status}`) || booking.status}
									</span>
								</div>

								<div className='bg-slate-50 p-3 rounded-lg mb-4'>
									<div className='flex justify-between items-center text-sm'>
										<span className='text-slate-600 font-medium'>
											{booking.service?.name || t("dashboard.bookings.unknown_service")}
										</span>
										<span className='text-slate-900 font-bold'>
											{booking.service?.price} {booking.service?.currency}
										</span>
									</div>
									<div className='text-xs text-slate-500 mt-1'>
										{booking.service?.duration} min
									</div>
								</div>

								<div className='flex gap-2'>
									{booking.status === "pending" && (
										<>
											<button
												onClick={() => handleStatusUpdate(booking.id, "confirmed")}
												disabled={processingId === booking.id}
												className='flex-1 py-2 bg-green-50 text-green-700 font-medium rounded-lg border border-green-100 flex items-center justify-center gap-2'
											>
												<Check className='w-4 h-4' />
												{t("dashboard.bookings.actions.confirm") || "Confirm"}
											</button>
											<button
												onClick={() => handleStatusUpdate(booking.id, "cancelled")}
												disabled={processingId === booking.id}
												className='flex-1 py-2 bg-red-50 text-red-700 font-medium rounded-lg border border-red-100 flex items-center justify-center gap-2'
											>
												<X className='w-4 h-4' />
												{t("dashboard.bookings.actions.cancel") || "Cancel"}
											</button>
										</>
									)}
									{booking.status === "confirmed" && (
										<>
											<button
												onClick={() => handleStatusUpdate(booking.id, "completed")}
												disabled={processingId === booking.id}
												className='flex-1 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg border border-blue-100 flex items-center justify-center gap-2'
											>
												<Check className='w-4 h-4' />
												{t("dashboard.bookings.actions.complete") || "Complete"}
											</button>
											<button
												onClick={() => handleStatusUpdate(booking.id, "no_show")}
												disabled={processingId === booking.id}
												className='flex-1 py-2 bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-200 flex items-center justify-center gap-2'
											>
												<UserX className='w-4 h-4' />
												{t("dashboard.bookings.actions.no_show") || "No Show"}
											</button>
										</>
									)}
								</div>
							</div>
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className='flex justify-center items-center gap-4 mt-6'>
							<button
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
								className='p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'
							>
								<ChevronLeft className='w-5 h-5 text-slate-600' />
							</button>
							<span className='text-sm font-medium text-slate-600'>
								{t("common.page") || "Page"} {page} / {totalPages}
							</span>
							<button
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page === totalPages}
								className='p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'
							>
								<ChevronRight className='w-5 h-5 text-slate-600' />
							</button>
						</div>
					)}
				</>
			)}
		</div>
	)
}
