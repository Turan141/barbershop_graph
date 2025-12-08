import { useEffect, useState } from "react"
import { useAuthStore } from "../store/authStore"
import { Booking, Barber, User } from "../types"
import { api } from "../services/api"
import {
	Calendar,
	Clock,
	Scissors,
	X,
	CheckCircle,
	Check,
	User as UserIcon
} from "lucide-react"
import clsx from "clsx"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

export const UserBookingsPage = () => {
	const { t } = useTranslation()
	const { user } = useAuthStore()
	const navigate = useNavigate()
	const [bookings, setBookings] = useState<Booking[]>([])
	const [barbers, setBarbers] = useState<Record<string, Barber>>({})
	const [clients, setClients] = useState<Record<string, User>>({})
	const [loading, setLoading] = useState(true)

	const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)
	const [cancelReason, setCancelReason] = useState("")

	const isBarber = user?.role === "barber"

	useEffect(() => {
		if (!user) return

		const fetchData = async () => {
			try {
				let data: Booking[] = []
				if (isBarber) {
					data = await api.bookings.listForBarber(user.id)
					setBookings(data)

					// Fetch current barber details to ensure we have services
					try {
						const myProfile = await api.barbers.get(user.id)
						setBarbers({ [myProfile.id]: myProfile })
					} catch (e) {
						console.error("Failed to fetch my profile", e)
					}

					const clientIds = Array.from(new Set(data.map((b) => b.clientId)))
					const clientsData: Record<string, User> = {}

					await Promise.all(
						clientIds.map(async (id) => {
							try {
								const client = await api.users.get(id)
								clientsData[id] = client
							} catch (e) {
								console.error(`Failed to fetch client ${id}`, e)
							}
						})
					)
					setClients(clientsData)
				} else {
					data = await api.bookings.listForClient(user.id)
					setBookings(data)

					const barberIds = Array.from(new Set(data.map((b) => b.barberId)))
					const barbersData: Record<string, Barber> = {}

					await Promise.all(
						barberIds.map(async (id) => {
							try {
								const barber = await api.barbers.get(id)
								barbersData[id] = barber
							} catch (e) {
								console.error(`Failed to fetch barber ${id}`, e)
							}
						})
					)
					setBarbers(barbersData)
				}
			} catch (error) {
				console.error(error)
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [user, navigate, isBarber])

	const handleStatusChange = async (
		bookingId: string,
		status: Booking["status"],
		comment?: string
	) => {
		try {
			await api.bookings.updateStatus(bookingId, status, comment)
			setBookings((prev) =>
				prev.map((b) => (b.id === bookingId ? { ...b, status, comment } : b))
			)
			setCancellingBookingId(null)
			setCancelReason("")
		} catch (error) {
			console.error("Failed to update booking status", error)
		}
	}

	const renderBookingCard = (booking: Booking) => {
		const barber = barbers[booking.barberId]
		const client = isBarber ? clients[booking.clientId] : null
		const service = barber?.services?.find((s) => s.id === booking.serviceId)
		const isPast = new Date(booking.date + "T" + booking.time) < new Date()
		return (
			<div
				key={booking.id}
				className={clsx(
					"bg-white p-4 rounded-xl border transition-all flex flex-col gap-3 shadow-sm",
					isPast
						? "border-slate-100 opacity-75"
						: "border-slate-200 hover:shadow-md hover:border-primary-200"
				)}
			>
				{/* Header */}
				<div className='flex items-start justify-between gap-3'>
					<div className='flex items-center gap-3'>
						<div className='w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center'>
							{isBarber ? (
								client?.avatarUrl ? (
									<img
										src={client.avatarUrl}
										alt={client.name}
										className='w-full h-full object-cover'
									/>
								) : (
									<UserIcon className='w-5 h-5 text-slate-400' />
								)
							) : barber?.avatarUrl ? (
								<img
									src={barber.avatarUrl}
									alt={barber.name}
									className='w-full h-full object-cover'
								/>
							) : (
								<Scissors className='w-5 h-5 text-slate-400' />
							)}
						</div>
						<div>
							<h3 className='font-bold text-sm text-slate-900 line-clamp-1'>
								{isBarber
									? client?.name || t("dashboard.bookings.unknown_client")
									: barber?.name || t("user_bookings.unknown_barber")}
							</h3>
							<div className='flex items-center gap-2 text-xs text-slate-500'>
								<span className='flex items-center gap-1'>
									<Calendar className='w-3 h-3' /> {booking.date}
								</span>
								<span className='flex items-center gap-1'>
									<Clock className='w-3 h-3' /> {booking.time}
								</span>
							</div>
						</div>
					</div>
					<div className='text-right flex-shrink-0'>
						<div className='font-bold text-slate-900 text-sm'>
							{service?.currency === "AZN" ? "₼" : service?.currency}
							{service?.price}
						</div>
					</div>
				</div>

				{/* Service Name - Prominent */}
				<div className='bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex items-center gap-2'>
					<Scissors className='w-4 h-4 text-primary-500 flex-shrink-0' />
					<span className='text-sm font-medium text-slate-700 line-clamp-1'>
						{service?.name || t("dashboard.bookings.service_deleted")}
					</span>
				</div>

				{/* Status Badge (Visible on Mobile or Client View, hidden in Kanban if column implies status) */}
				{!isBarber && (
					<div className='flex items-center justify-between'>
						<span
							className={clsx(
								"px-2.5 py-1 rounded-full text-xs font-bold capitalize flex items-center gap-1.5",
								booking.status === "confirmed"
									? "bg-green-100 text-green-700"
									: booking.status === "pending" || booking.status === "upcoming"
									? "bg-yellow-100 text-yellow-700"
									: booking.status === "cancelled"
									? "bg-red-100 text-red-700"
									: "bg-slate-100 text-slate-700"
							)}
						>
							{booking.status === "confirmed" && <CheckCircle className='w-3 h-3' />}
							{(booking.status === "pending" || booking.status === "upcoming") && (
								<Clock className='w-3 h-3' />
							)}
							{booking.status === "cancelled" && <X className='w-3 h-3' />}
							{booking.status}
						</span>
					</div>
				)}

				{/* Actions */}
				<div className='flex items-center justify-end gap-2'>
					{cancellingBookingId === booking.id ? (
						<div className='flex flex-col gap-2 w-full animate-fade-in mt-2'>
							<input
								type='text'
								value={cancelReason}
								onChange={(e) => setCancelReason(e.target.value)}
								placeholder={t("dashboard.bookings.cancel_reason_prompt")}
								className='w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'
								autoFocus
							/>
							<div className='flex gap-2 justify-end'>
								<button
									onClick={() => {
										setCancellingBookingId(null)
										setCancelReason("")
									}}
									className='px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg'
								>
									{t("dashboard.bookings.actions.cancel")}
								</button>
								<button
									onClick={() =>
										handleStatusChange(booking.id, "cancelled", cancelReason)
									}
									className='px-3 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg'
								>
									{t("dashboard.bookings.actions.confirm")}
								</button>
							</div>
						</div>
					) : (
						<>
							{/* Client Cancel Action */}
							{!isBarber && !isPast && booking.status !== "cancelled" && (
								<button
									onClick={() => {
										setCancellingBookingId(booking.id)
										setCancelReason("")
									}}
									className='p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
									title={t("user_bookings.cancel_tooltip")}
								>
									<X className='w-5 h-5' />
								</button>
							)}

							{/* Barber Actions */}
							{isBarber && !isPast && booking.status !== "cancelled" && (
								<div className='flex gap-2 w-full justify-end pt-2 border-t border-slate-50 mt-1'>
									{(booking.status === "pending" || booking.status === "upcoming") && (
										<button
											onClick={() => handleStatusChange(booking.id, "confirmed")}
											className='flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium'
										>
											<Check className='w-4 h-4' />
											{t("dashboard.bookings.actions.confirm")}
										</button>
									)}
									{booking.status === "confirmed" && (
										<button
											onClick={() => handleStatusChange(booking.id, "completed")}
											className='flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium'
										>
											<CheckCircle className='w-4 h-4' />
											{t("dashboard.bookings.actions.complete")}
										</button>
									)}
									<button
										onClick={() => {
											setCancellingBookingId(booking.id)
											setCancelReason("")
										}}
										className='px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium'
										title={t("dashboard.bookings.actions.cancel")}
									>
										<X className='w-4 h-4' />
									</button>
								</div>
							)}
						</>
					)}
				</div>

				{booking.comment && (
					<div className='mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 italic'>
						{booking.comment}
					</div>
				)}
			</div>
		)
	}

	if (!user) return null

	const KanbanColumn = ({
		title,
		color,
		bookings
	}: {
		title: string
		status?: string
		color: string
		bookings: Booking[]
	}) => (
		<div className='flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200/60 overflow-hidden'>
			<div className={clsx("p-4 border-b border-slate-100", `bg-${color}-50/50`)}>
				<div className='flex items-center justify-between mb-1'>
					<h3 className={clsx("font-bold", `text-${color}-900`)}>{title}</h3>
					<span
						className={clsx(
							"px-2 py-0.5 rounded-full text-xs font-bold",
							`bg-${color}-100 text-${color}-700`
						)}
					>
						{bookings.length}
					</span>
				</div>
			</div>
			<div className='p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-thin'>
				{bookings.map((b) => renderBookingCard(b))}
				{bookings.length === 0 && (
					<div className='text-center py-8 text-slate-400 text-sm italic'>
						{t("dashboard.bookings.no_bookings")}
					</div>
				)}
			</div>
		</div>
	)

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-slate-900'>{t("user_bookings.title")}</h1>
				<p className='text-slate-500 mt-1'>{t("user_bookings.subtitle")}</p>
			</div>

			{loading ? (
				<div className='space-y-4'>
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className='bg-white rounded-xl h-32 animate-pulse shadow-sm border border-slate-100'
						></div>
					))}
				</div>
			) : bookings.length === 0 ? (
				<div className='text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200'>
					<Calendar className='w-16 h-16 text-slate-300 mx-auto mb-4' />
					<h2 className='text-xl font-semibold text-slate-900 mb-2'>
						{t("user_bookings.no_bookings_title")}
					</h2>
					<p className='text-slate-500 mb-6'>{t("user_bookings.no_bookings_desc")}</p>
					<Link to='/' className='btn-primary inline-flex items-center gap-2'>
						<Scissors className='w-4 h-4' />
						{t("user_bookings.book_now")}
					</Link>
				</div>
			) : (
				<>
					{isBarber ? (
						<>
							{/* Desktop Kanban View */}
							<div className='hidden md:grid grid-cols-4 gap-6 items-start h-full'>
								<KanbanColumn
									title={t("dashboard.bookings.status.pending")}
									status='pending'
									color='yellow'
									bookings={bookings.filter(
										(b) => b.status === "pending" || b.status === "upcoming"
									)}
								/>
								<KanbanColumn
									title={t("dashboard.bookings.status.confirmed")}
									status='confirmed'
									color='green'
									bookings={bookings.filter((b) => b.status === "confirmed")}
								/>
								<KanbanColumn
									title={t("dashboard.bookings.status.completed")}
									status='completed'
									color='blue'
									bookings={bookings.filter((b) => b.status === "completed")}
								/>
								<KanbanColumn
									title={t("dashboard.bookings.status.cancelled")}
									status='cancelled'
									color='red'
									bookings={bookings.filter((b) => b.status === "cancelled")}
								/>
							</div>

							{/* Mobile List View */}
							<div className='md:hidden space-y-4'>
								{bookings
									.sort(
										(a, b) =>
											new Date(b.date + "T" + b.time).getTime() -
											new Date(a.date + "T" + a.time).getTime()
									)
									.map((b) => renderBookingCard(b))}
							</div>
						</>
					) : (
						/* Client List View */
						<div className='space-y-4 max-w-3xl mx-auto'>
							{bookings
								.sort(
									(a, b) =>
										new Date(b.date + "T" + b.time).getTime() -
										new Date(a.date + "T" + a.time).getTime()
								)
								.map((b) => renderBookingCard(b))}
						</div>
					)}
				</>
			)}
		</div>
	)
}
