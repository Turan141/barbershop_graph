import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { api } from "../services/api"
import { Barber, Service } from "../types"
import { useAuthStore } from "../store/authStore"
import { useFavoritesStore } from "../store/favoritesStore"
import {
	Star,
	Heart,
	Clock,
	Check,
	ChevronLeft,
	MapPin,
	Calendar,
	ShieldCheck,
	Scissors,
	ArrowRight,
	Image as ImageIcon
} from "lucide-react"
import clsx from "clsx"

export const BarberProfilePage = () => {
	const { t, i18n } = useTranslation()
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { user } = useAuthStore()
	const { isFavorite, addFavorite, removeFavorite, fetchFavorites } = useFavoritesStore()

	const [barber, setBarbers] = useState<Barber | null>(null)
	const [selectedService, setSelectedService] = useState<Service | null>(null)
	const [selectedDate, setSelectedDate] = useState<string>("")
	const [selectedTime, setSelectedTime] = useState<string>("")
	const [bookingStatus, setBookingStatus] = useState<
		"idle" | "submitting" | "success" | "error"
	>("idle")
	const [showAllPortfolio, setShowAllPortfolio] = useState(false)

	useEffect(() => {
		if (id) {
			api.barbers.get(id).then(setBarbers)
			if (user) fetchFavorites(user.id)
		}
	}, [id, user])

	if (!barber)
		return (
			<div className='min-h-[60vh] flex items-center justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600'></div>
			</div>
		)

	const isFav = id ? isFavorite(id) : false

	const toggleFavorite = () => {
		if (!user) return navigate("/login")
		if (id) {
			isFav ? removeFavorite(user.id, id) : addFavorite(user.id, id)
		}
	}

	const handleBook = async () => {
		if (!user) return navigate("/login")
		if (!selectedService || !selectedDate || !selectedTime || !id) return

		setBookingStatus("submitting")
		try {
			await api.bookings.create({
				barberId: id,
				clientId: user.id,
				serviceId: selectedService.id,
				date: selectedDate,
				time: selectedTime
			})
			setBookingStatus("success")
		} catch (error) {
			setBookingStatus("error")
		}
	}

	// Generate next 7 days for calendar
	const dates = Array.from({ length: 7 }, (_, i) => {
		const d = new Date()
		d.setDate(d.getDate() + i)
		return {
			label: d.toLocaleDateString(i18n.language, { weekday: "short", day: "numeric" }),
			fullLabel: d.toLocaleDateString(i18n.language, {
				weekday: "long",
				month: "long",
				day: "numeric"
			}),
			value: d.toISOString().split("T")[0],
			dayName: d.toLocaleDateString("en-US", { weekday: "long" }) // Keep en-US for schedule lookup
		}
	})

	const availableSlots = selectedDate
		? barber.schedule[dates.find((d) => d.value === selectedDate)?.dayName || ""] || []
		: []

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in'>
			{/* Breadcrumb */}
			<button
				onClick={() => navigate(-1)}
				className='flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors'
			>
				<ChevronLeft className='w-4 h-4 mr-1' />
				{t("profile.back_to_search")}
			</button>

			<div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
				{/* Left Column: Info (8 cols) */}
				<div className='lg:col-span-8 space-y-8'>
					{/* Profile Header Card */}
					<div className='card p-8 relative overflow-hidden bg-white'>
						<div className='absolute top-0 left-0 w-full h-32 bg-slate-100'></div>
						<div className='relative flex flex-col sm:flex-row gap-6 items-start pt-12'>
							<div className='relative'>
								<img
									src={barber.avatarUrl}
									alt={barber.name}
									className='w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg'
								/>
								<div className='absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white'>
									{t("profile.open")}
								</div>
							</div>

							<div className='flex-grow pt-2'>
								<div className='flex justify-between items-start'>
									<div>
										<h1 className='text-3xl font-bold text-slate-900'>{barber.name}</h1>
										<div className='flex items-center text-slate-500 mt-2'>
											<MapPin className='w-4 h-4 mr-1' />
											{barber.location}
										</div>
									</div>
									<button
										onClick={toggleFavorite}
										className={clsx(
											"p-3 rounded-xl transition-all border",
											isFav
												? "bg-red-50 border-red-100 text-red-500"
												: "bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100"
										)}
									>
										<Heart className={clsx("w-6 h-6", isFav && "fill-current")} />
									</button>
								</div>

								<div className='flex items-center gap-6 mt-6'>
									<div className='flex items-center gap-2'>
										<div className='bg-yellow-100 p-1.5 rounded-lg'>
											<Star className='w-5 h-5 text-yellow-600 fill-yellow-600' />
										</div>
										<div>
											<div className='font-bold text-slate-900'>{barber.rating}</div>
											<div className='text-xs text-slate-500'>
												{barber.reviewCount} {t("profile.reviews")}
											</div>
										</div>
									</div>
									<div className='w-px h-8 bg-slate-200'></div>
									<div className='flex items-center gap-2'>
										<div className='bg-blue-100 p-1.5 rounded-lg'>
											<ShieldCheck className='w-5 h-5 text-blue-600' />
										</div>
										<div>
											<div className='font-bold text-slate-900'>
												{t("profile.verified")}
											</div>
											<div className='text-xs text-slate-500'>
												{t("profile.professional")}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className='mt-8 pt-8 border-t border-slate-100'>
							<h3 className='font-semibold text-slate-900 mb-3'>{t("profile.about")}</h3>
							<p className='text-slate-600 leading-relaxed'>{barber.bio}</p>
						</div>
					</div>

					{/* Location Map */}
					<div>
						<h2 className='text-xl font-bold text-slate-900 mb-4 flex items-center gap-2'>
							<MapPin className='w-5 h-5 text-primary-600' />
							{t("profile.location")}
						</h2>
						<div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-64 relative group'>
							<iframe
								width='100%'
								height='100%'
								frameBorder='0'
								scrolling='no'
								marginHeight={0}
								marginWidth={0}
								src={`https://maps.google.com/maps?q=${encodeURIComponent(
									barber.location
								)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
								className='filter grayscale group-hover:grayscale-0 transition-all duration-500'
							></iframe>
							<div className='absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-slate-100 flex items-center gap-2 text-sm font-medium text-slate-900'>
								<MapPin className='w-4 h-4 text-primary-600' />
								{barber.location}
							</div>
						</div>
					</div>

					{/* Portfolio Section */}
					{barber.portfolio && barber.portfolio.length > 0 && (
						<div>
							<div className='flex justify-between items-center mb-4'>
								<h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
									<ImageIcon className='w-5 h-5 text-primary-600' />
									{t("profile.portfolio")}
								</h2>
								{barber.portfolio.length > 4 && (
									<button
										onClick={() => setShowAllPortfolio(!showAllPortfolio)}
										className='text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors'
									>
										{showAllPortfolio ? t("profile.show_less") : t("profile.view_all")}
									</button>
								)}
							</div>
							<div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
								{(showAllPortfolio ? barber.portfolio : barber.portfolio.slice(0, 4)).map(
									(url, index) => (
										<div
											key={index}
											className='aspect-square rounded-xl overflow-hidden bg-slate-100 group cursor-pointer'
											onClick={() => window.open(url, "_blank")}
										>
											<img
												src={url}
												alt={`Portfolio ${index + 1}`}
												className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
											/>
										</div>
									)
								)}
							</div>
						</div>
					)}

					{/* Services List */}
					<div>
						<h2 className='text-xl font-bold text-slate-900 mb-4'>
							{t("profile.select_service")}
						</h2>
						<div className='grid grid-cols-1 gap-4'>
							{barber.services.map((service) => (
								<div
									key={service.id}
									onClick={() => setSelectedService(service)}
									className={clsx(
										"group flex justify-between items-center p-5 rounded-xl border cursor-pointer transition-all duration-200",
										selectedService?.id === service.id
											? "border-primary-600 bg-primary-50/50 ring-1 ring-primary-600 shadow-sm"
											: "bg-white border-slate-200 hover:border-primary-300 hover:shadow-md"
									)}
								>
									<div className='flex items-center gap-4'>
										<div
											className={clsx(
												"w-10 h-10 rounded-full flex items-center justify-center transition-colors",
												selectedService?.id === service.id
													? "bg-primary-100 text-primary-600"
													: "bg-slate-100 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-500"
											)}
										>
											<Scissors className='w-5 h-5' />
										</div>
										<div>
											<h3 className='font-semibold text-slate-900'>{service.name}</h3>
											<div className='flex items-center text-sm text-slate-500 mt-0.5'>
												<Clock className='w-3.5 h-3.5 mr-1' />
												{service.duration} {t("profile.min")}
											</div>
										</div>
									</div>
									<div className='text-right'>
										<div className='font-bold text-lg text-slate-900'>
											{service.currency === "AZN" ? "₼" : service.currency}
											{service.price}
										</div>
										<div
											className={clsx(
												"text-xs font-medium mt-1",
												selectedService?.id === service.id
													? "text-primary-600"
													: "text-slate-400"
											)}
										>
											{selectedService?.id === service.id
												? t("profile.selected")
												: t("profile.select")}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Right Column: Booking Widget (4 cols) */}
				<div className='lg:col-span-4'>
					<div className='sticky top-24'>
						<div className='card p-6 shadow-lg border-slate-200 bg-white'>
							<h2 className='text-lg font-bold text-slate-900 mb-6 flex items-center gap-2'>
								<Calendar className='w-5 h-5 text-primary-600' />
								{t("profile.book_appointment")}
							</h2>

							{bookingStatus === "success" ? (
								<div className='text-center py-10 animate-fade-in'>
									<div className='w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm'>
										<Check className='w-8 h-8' />
									</div>
									<h3 className='text-xl font-bold text-slate-900 mb-2'>
										{t("profile.appointment_confirmed")}
									</h3>
									<p className='text-slate-600 mb-8'>
										{t("profile.appointment_success_message")}
									</p>
									<button
										onClick={() => {
											setBookingStatus("idle")
											setSelectedService(null)
											setSelectedDate("")
											setSelectedTime("")
										}}
										className='btn-secondary w-full'
									>
										{t("profile.book_another")}
									</button>
								</div>
							) : (
								<div className='space-y-6'>
									{/* Date Selection */}
									<div>
										<label className='block text-sm font-medium text-slate-700 mb-3'>
											{t("profile.select_date")}
										</label>
										<div className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
											{dates.map((d) => (
												<button
													key={d.value}
													onClick={() => {
														setSelectedDate(d.value)
														setSelectedTime("")
													}}
													className={clsx(
														"flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border transition-all",
														selectedDate === d.value
															? "bg-primary-600 text-white border-primary-600 shadow-md scale-105"
															: "bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-slate-50"
													)}
												>
													<span className='text-xs font-medium opacity-80'>
														{d.label.split(" ")[0]}
													</span>
													<span className='text-lg font-bold'>
														{d.label.split(" ")[1]}
													</span>
												</button>
											))}
										</div>
									</div>

									{/* Time Selection */}
									<div
										className={clsx(
											"transition-opacity duration-300",
											!selectedDate && "opacity-50 pointer-events-none"
										)}
									>
										<label className='block text-sm font-medium text-slate-700 mb-3'>
											{t("profile.available_times")}{" "}
											{selectedDate && (
												<span className='font-normal text-slate-500'>
													- {dates.find((d) => d.value === selectedDate)?.fullLabel}
												</span>
											)}
										</label>
										<div className='grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1'>
											{availableSlots.length > 0 ? (
												availableSlots.map((time) => (
													<button
														key={time}
														onClick={() => setSelectedTime(time)}
														className={clsx(
															"py-2 px-1 text-sm font-medium rounded-lg border transition-all",
															selectedTime === time
																? "bg-primary-600 text-white border-primary-600 shadow-sm"
																: "bg-white border-slate-200 text-slate-700 hover:border-primary-400 hover:text-primary-600"
														)}
													>
														{time}
													</button>
												))
											) : (
												<div className='col-span-3 text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
													{t("profile.no_slots")}
												</div>
											)}
										</div>
									</div>

									{/* Summary & Action */}
									<div className='pt-6 border-t border-slate-100'>
										<div className='flex justify-between items-end mb-6'>
											<div className='text-sm text-slate-500'>
												{t("profile.total_price")}
											</div>
											<div className='text-2xl font-bold text-slate-900'>
												{selectedService
													? `${
															selectedService.currency === "AZN"
																? "₼"
																: selectedService.currency
													  }${selectedService.price}`
													: "₼0"}
											</div>
										</div>

										<button
											onClick={handleBook}
											disabled={
												!selectedService ||
												!selectedDate ||
												!selectedTime ||
												bookingStatus === "submitting"
											}
											className='btn-primary w-full flex items-center justify-center gap-2'
										>
											{bookingStatus === "submitting" ? (
												<>{t("profile.processing")}</>
											) : (
												<>
													{t("profile.confirm")} <ArrowRight className='w-4 h-4' />
												</>
											)}
										</button>

										{bookingStatus === "error" && (
											<p className='text-red-500 text-sm text-center mt-3 bg-red-50 py-2 rounded-lg'>
												{t("profile.slot_taken")}
											</p>
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
