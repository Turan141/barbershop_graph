import { useEffect, useState } from "react"
import { useAuthStore } from "../store/authStore"
import { Booking, Barber } from "../types"
import { api } from "../services/api"
import { Calendar, Clock, MapPin, Scissors, X, CheckCircle } from "lucide-react"
import clsx from "clsx"
import { Link, useNavigate, useLocation } from "react-router-dom"

export const UserBookingsPage = () => {
	const { user } = useAuthStore()
	const navigate = useNavigate()
	const location = useLocation()
	const [bookings, setBookings] = useState<Booking[]>([])
	const [barbers, setBarbers] = useState<Record<string, Barber>>({})
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!user) return

		const fetchData = async () => {
			try {
				const data = await api.bookings.listForClient(user.id)
				setBookings(data)

				// Fetch barber details for each booking
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
			} catch (error) {
				console.error(error)
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [user, navigate])

	const handleCancel = async (bookingId: string) => {
		if (!confirm("Randevunu ləğv etmək istədiyinizə əminsiniz?")) return

		try {
			await api.bookings.updateStatus(bookingId, "cancelled")
			setBookings((prev) =>
				prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
			)
		} catch (error) {
			console.error("Failed to cancel booking", error)
		}
	}

	if (!user) return null

	return (
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-slate-900'>Randevularım</h1>
				<p className='text-slate-500 mt-1'>Qarşıdan gələn və keçmiş randevularınız</p>
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
					<h2 className='text-xl font-semibold text-slate-900 mb-2'>Randevu tapılmadı</h2>
					<p className='text-slate-500 mb-6'>Hələ heç bir randevu almamısınız.</p>
					<Link to='/' className='btn-primary inline-flex items-center gap-2'>
						<Scissors className='w-4 h-4' />
						Randevu Al
					</Link>
				</div>
			) : (
				<div className='space-y-4'>
					{bookings
						.sort(
							(a, b) =>
								new Date(b.date + "T" + b.time).getTime() -
								new Date(a.date + "T" + a.time).getTime()
						)
						.map((booking) => {
							const barber = barbers[booking.barberId]
							const service = barber?.services.find((s) => s.id === booking.serviceId)
							const isPast = new Date(booking.date + "T" + booking.time) < new Date()

							return (
								<div
									key={booking.id}
									className={clsx(
										"bg-white p-6 rounded-2xl border transition-all",
										isPast
											? "border-slate-100 opacity-75"
											: "border-slate-200 shadow-sm hover:shadow-md hover:border-primary-200"
									)}
								>
									<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
										<div className='flex items-start gap-4'>
											<div className='w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0'>
												{barber?.avatarUrl ? (
													<img
														src={barber.avatarUrl}
														alt={barber.name}
														className='w-full h-full object-cover'
													/>
												) : (
													<Scissors className='w-8 h-8 text-slate-400 m-auto mt-4' />
												)}
											</div>
											<div>
												<h3 className='font-bold text-lg text-slate-900'>
													{barber?.name || "Naməlum Bərbər"}
												</h3>
												<div className='flex items-center text-slate-500 text-sm mt-1'>
													<MapPin className='w-3.5 h-3.5 mr-1' />
													{barber?.location}
												</div>
												<div className='flex items-center gap-3 mt-2'>
													<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium'>
														<Calendar className='w-3.5 h-3.5' />
														{booking.date}
													</span>
													<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium'>
														<Clock className='w-3.5 h-3.5' />
														{booking.time}
													</span>
												</div>
											</div>
										</div>

										<div className='flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4'>
											<div className='text-right'>
												<div className='font-bold text-slate-900'>
													{service?.currency === "AZN" ? "₼" : service?.currency}
													{service?.price}
												</div>
												<div className='text-xs text-slate-500'>{service?.name}</div>
											</div>

											<div className='flex items-center gap-3'>
												<span
													className={clsx(
														"px-3 py-1 rounded-full text-xs font-bold capitalize flex items-center gap-1.5",
														booking.status === "confirmed"
															? "bg-green-100 text-green-700"
															: booking.status === "pending"
															? "bg-yellow-100 text-yellow-700"
															: booking.status === "cancelled"
															? "bg-red-100 text-red-700"
															: "bg-slate-100 text-slate-700"
													)}
												>
													{booking.status === "confirmed" && (
														<CheckCircle className='w-3.5 h-3.5' />
													)}
													{booking.status === "pending" && (
														<Clock className='w-3.5 h-3.5' />
													)}
													{booking.status === "cancelled" && (
														<X className='w-3.5 h-3.5' />
													)}
													{booking.status === "confirmed"
														? "Təsdiqlənib"
														: booking.status === "pending"
														? "Gözləyir"
														: booking.status === "cancelled"
														? "Ləğv edilib"
														: "Tamamlanıb"}
												</span>

												{!isPast && booking.status !== "cancelled" && (
													<button
														onClick={() => handleCancel(booking.id)}
														className='p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
														title='Randevunu ləğv et'
													>
														<X className='w-5 h-5' />
													</button>
												)}
											</div>
										</div>
									</div>
								</div>
							)
						})}
				</div>
			)}
		</div>
	)
}
