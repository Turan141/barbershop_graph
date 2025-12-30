import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { enUS, ru, az } from "date-fns/locale"
import {
	Check,
	ChevronDown,
	Clock,
	Scissors,
	ArrowRight,
	AlertCircle,
	User,
	MessageCircle
} from "lucide-react"
import clsx from "clsx"
import { Barber, Service, Booking } from "../types"
import { api } from "../services/api"
import { useAuthStore } from "../store/authStore"
import { NotificationService } from "../services/notifications"
import { isSlotAvailable, generateTimeSlots } from "../utils/bookingLogic"
import toast from "react-hot-toast"

const locales: Record<string, any> = {
	en: enUS,
	ru: ru,
	az: az
}

interface BookingWidgetProps {
	barber: Barber
	selectedService: Service | null
	onServiceSelect: (service: Service | null) => void
	onSuccess?: () => void
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
	barber,
	selectedService,
	onServiceSelect,
	onSuccess
}) => {
	const { t, i18n } = useTranslation()
	const { user } = useAuthStore()

	const [selectedDate, setSelectedDate] = useState<string>("")
	const [selectedTime, setSelectedTime] = useState<string>("")
	const [guestName, setGuestName] = useState("")
	const [guestPhone, setGuestPhone] = useState("")
	const [bookForSomeoneElse, setBookForSomeoneElse] = useState(false)
	const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false)
	const [bookingStatus, setBookingStatus] = useState<
		"idle" | "submitting" | "success" | "error"
	>("idle")
	const [bookings, setBookings] = useState<Booking[]>([])
	const [availabilityLoading, setAvailabilityLoading] = useState(false)
	const [availabilityError, setAvailabilityError] = useState(false)
	const [availabilityReloadNonce, setAvailabilityReloadNonce] = useState(0)

	// Generate next 7 days for calendar
	const dates = Array.from({ length: 7 }, (_, i) => {
		const d = new Date()
		d.setDate(d.getDate() + i)
		const currentLocale = locales[i18n.language] || enUS
		return {
			label: format(d, "EEE, d", { locale: currentLocale }),
			fullLabel: format(d, "EEEE, d MMMM", { locale: currentLocale }),
			value: format(d, "yyyy-MM-dd"),
			dayName: format(d, "EEEE", { locale: enUS }) // Keep en-US for schedule lookup
		}
	})

	// Set default date to today on mount
	useEffect(() => {
		if (dates.length > 0 && !selectedDate) {
			setSelectedDate(dates[0].value)
		}
	}, [])

	const handleWhatsAppClick = () => {
		if (!barber.phone) return
		const message =
			t("profile.whatsapp_message") || "Hello, I would like to book an appointment."
		const url = `https://wa.me/${barber.phone.replace(
			/\D/g,
			""
		)}?text=${encodeURIComponent(message)}`
		window.open(url, "_blank")
	}

	useEffect(() => {
		let cancelled = false

		if (!barber.id || !selectedDate) {
			setBookings([])
			setAvailabilityLoading(false)
			return
		}

		setAvailabilityLoading(true)
		setAvailabilityError(false)
		setBookings([])
		api.bookings
			.listForBarber(barber.id, { date: selectedDate })
			.then((data) => {
				if (!cancelled) setBookings(data)
			})
			.catch((err) => {
				console.error("Failed to fetch bookings", err)
				if (!cancelled) setAvailabilityError(true)
			})
			.finally(() => {
				if (!cancelled) setAvailabilityLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [barber.id, selectedDate, availabilityReloadNonce])

	const handleBook = async () => {
		if (!selectedService || !selectedDate || !selectedTime || !barber.id) return

		// Guest validation
		if (!user || bookForSomeoneElse) {
			if (!guestName.trim() || !guestPhone.trim()) {
				toast.error(
					t("auth.guest_details_required") || "Please enter your name and phone"
				)
				return
			}
		}

		setBookingStatus("submitting")
		try {
			const booking = await api.bookings.create({
				barberId: barber.id,
				clientId: user && !bookForSomeoneElse ? user.id : undefined,
				guestName: !user || bookForSomeoneElse ? guestName : undefined,
				guestPhone: !user || bookForSomeoneElse ? guestPhone : undefined,
				serviceId: selectedService.id,
				date: selectedDate,
				time: selectedTime,
				asGuest: bookForSomeoneElse
			})

			// Schedule local notification
			await NotificationService.requestPermissions()
			await NotificationService.scheduleBookingReminder(
				booking.id,
				barber.name || "Barber",
				selectedDate,
				selectedTime
			)

			setBookingStatus("success")
			if (onSuccess) onSuccess()
		} catch (error: any) {
			setBookingStatus("error")
			let message = t("profile.booking_failed") || "Failed to book appointment"
			try {
				// Try to parse the error message if it's JSON string from api.ts handleResponse
				const parsed = JSON.parse(error.message)

				// Check for error code first for translation
				if (parsed.errorCode) {
					const translatedError = t(`profile.errors.${parsed.errorCode}`)
					// If translation exists and is not the key itself (basic check, though i18next usually returns key if missing)
					if (
						translatedError &&
						translatedError !== `profile.errors.${parsed.errorCode}`
					) {
						message = translatedError
					} else if (parsed.error) {
						message = parsed.error
					}
				} else if (parsed.error) {
					message = parsed.error
				}
			} catch (e) {
				// If parsing fails, use the error message directly if available
				if (error.message) {
					message = error.message
				}
			}
			toast.error(message)
		}
	}

	const generateSlots = () => {
		if (!selectedDate || !selectedService) return []
		const dayName = dates.find((d) => d.value === selectedDate)?.dayName || ""
		const schedule = barber.schedule[dayName]

		if (!schedule) return []

		// Handle both legacy array format and new object format
		let start = "09:00"
		let end = "18:00"

		if (Array.isArray(schedule)) {
			console.warn(
				"Encountered legacy schedule format (array). Using default 09:00-18:00."
			)
		} else if (typeof schedule === "object" && schedule !== null) {
			start = (schedule as any).start || "09:00"
			end = (schedule as any).end || "18:00"
		}

		return generateTimeSlots(start, end, selectedService.duration, 30, selectedDate)
	}

	const availableSlots = generateSlots()
	const selectedDayName = dates.find((d) => d.value === selectedDate)?.dayName || ""
	const daySchedule = selectedDayName ? barber.schedule[selectedDayName] : undefined

	if (bookingStatus === "success") {
		return (
			<div className='text-center py-10 animate-fade-in'>
				<div className='w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100 animate-slide-up'>
					<Check className='w-10 h-10' />
				</div>
				<h3 className='text-xl font-bold text-slate-900 mb-2'>
					{t("profile.appointment_confirmed")}
				</h3>
				<p className='text-slate-600 mb-8'>{t("profile.appointment_success_message")}</p>
				<button
					onClick={() => {
						setBookingStatus("idle")
						onServiceSelect(null)
						setSelectedDate("")
						setSelectedTime("")
					}}
					className='btn-secondary w-full'
				>
					{t("profile.book_another")}
				</button>
			</div>
		)
	}

	return (
		<div className='min-h-full flex flex-col'>
			<div className='flex-1 p-4 space-y-5 sm:space-y-8'>
				{/* Service Selection */}
				<div>
					<label className='block text-sm font-bold text-slate-900 mb-2 sm:mb-4'>
						{t("profile.select_service")}
					</label>
					<div className='relative'>
						<button
							onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
							className='w-full p-3 sm:p-4 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium text-slate-900 flex items-center justify-between transition-all hover:border-primary-300'
						>
							<span
								className={clsx(
									"truncate mr-2",
									!selectedService && "text-slate-500 font-normal"
								)}
							>
								{selectedService ? (
									<div className='flex items-center overflow-hidden'>
										<span className='truncate'>{selectedService.name}</span>
										<span className='mx-2 text-slate-300 flex-shrink-0'>|</span>
										<span className='text-primary-600 flex-shrink-0'>
											{selectedService.currency === "AZN"
												? "₼"
												: selectedService.currency}
											{selectedService.price}
										</span>
										<span className='mx-2 text-slate-300 flex-shrink-0'>|</span>
										<span className='text-slate-500 text-sm flex-shrink-0 flex items-center gap-1'>
											<Clock className='w-3 h-3' />
											{selectedService.duration} {t("profile.min")}
										</span>
									</div>
								) : (
									t("profile.select_service_placeholder") || "Select a service..."
								)}
							</span>
							<ChevronDown
								className={clsx(
									"w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0",
									isServiceDropdownOpen && "rotate-180 text-primary-500"
								)}
							/>
						</button>

						{isServiceDropdownOpen && (
							<>
								<div
									className='fixed inset-0 z-10'
									onClick={() => setIsServiceDropdownOpen(false)}
								></div>
								<div className='absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 max-h-80 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200'>
									{barber.services.map((service) => (
										<button
											key={service.id}
											onClick={() => {
												onServiceSelect(service)
												setIsServiceDropdownOpen(false)
											}}
											className={clsx(
												"w-full p-4 text-left hover:bg-primary-50/50 flex items-center justify-between group transition-all border-b border-slate-50 last:border-0",
												selectedService?.id === service.id && "bg-primary-50/30"
											)}
										>
											<div className='flex items-center gap-3 overflow-hidden'>
												<div
													className={clsx(
														"w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
														selectedService?.id === service.id
															? "bg-primary-100 text-primary-600"
															: "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-primary-500 group-hover:shadow-sm"
													)}
												>
													<Scissors className='w-4 h-4' />
												</div>
												<div className='truncate'>
													<div
														className={clsx(
															"font-medium truncate transition-colors",
															selectedService?.id === service.id
																? "text-primary-900"
																: "text-slate-900 group-hover:text-primary-700"
														)}
													>
														{service.name}
													</div>
													<div className='text-xs text-slate-500 flex items-center gap-1'>
														<Clock className='w-3 h-3' />
														{service.duration} {t("profile.min")}
													</div>
												</div>
											</div>
											<div className='flex items-center gap-3 pl-2 flex-shrink-0'>
												<div className='font-bold text-slate-900'>
													{service.currency === "AZN" ? "₼" : service.currency}
													{service.price}
												</div>
												{selectedService?.id === service.id && (
													<Check className='w-4 h-4 text-primary-600' />
												)}
											</div>
										</button>
									))}
								</div>
							</>
						)}
					</div>
				</div>

				{/* Date Selection */}
				<div
					className={clsx(
						"transition-all duration-500",
						!selectedService && "opacity-50 pointer-events-none blur-sm"
					)}
				>
					<label className='block text-sm font-bold text-slate-900 mb-2 sm:mb-4 flex items-center justify-between'>
						{t("profile.select_date")}
						<span className='text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full'>
							{dates[0].fullLabel}
						</span>
					</label>
					<div className='flex gap-2 sm:gap-3 overflow-x-auto py-2 sm:py-4 scrollbar-hide -mx-2 px-2'>
						{dates.map((d) => (
							<button
								key={d.value}
								onClick={() => {
									setSelectedDate(d.value)
									setSelectedTime("")
								}}
								className={clsx(
									"flex-shrink-0 w-14 h-20 sm:w-16 sm:h-24 rounded-2xl flex flex-col items-center justify-center border transition-all duration-300",
									selectedDate === d.value
										? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/30"
										: "bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-slate-50 hover:shadow-md"
								)}
							>
								<span
									className={clsx(
										"text-xs font-medium mb-1",
										selectedDate === d.value ? "opacity-80" : "opacity-60"
									)}
								>
									{d.label.split(" ")[0]}
								</span>
								<span className='text-xl font-bold'>{d.label.split(" ")[1]}</span>
							</button>
						))}
					</div>
				</div>

				{/* Time Selection */}
				<div
					className={clsx(
						"transition-all duration-500",
						(!selectedDate || !selectedService) &&
							"opacity-50 pointer-events-none blur-sm",
						availabilityLoading && "opacity-60 pointer-events-none"
					)}
				>
					<label className='block text-sm font-bold text-slate-900 mb-2'>
						{t("profile.available_times")}{" "}
						{selectedDate && (
							<span className='font-normal text-slate-500 ml-2'>
								- {dates.find((d) => d.value === selectedDate)?.fullLabel}
							</span>
						)}
					</label>
					<p className='text-xs text-slate-500 mb-4 flex items-start gap-1.5'>
						<Clock className='w-3.5 h-3.5 mt-0.5 flex-shrink-0' />
						{t("profile.dynamic_slots_hint") ||
							"Time slots are calculated based on the service duration."}
					</p>

					{availabilityLoading && (
						<div className='mb-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 text-xs text-slate-700'>
							<Clock className='w-4 h-4 flex-shrink-0 text-slate-500' />
							<p>{t("profile.loading_availability") || "Loading availability..."}</p>
						</div>
					)}

					{availabilityError && !availabilityLoading && (
						<div className='mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start justify-between gap-3 text-xs text-amber-900'>
							<div className='flex items-start gap-2'>
								<AlertCircle className='w-4 h-4 flex-shrink-0 text-amber-700' />
								<p>
									{t("profile.availability_load_failed") ||
										"Failed to load availability."}
								</p>
							</div>
							<button
								onClick={() => setAvailabilityReloadNonce((n) => n + 1)}
								className='text-amber-800 font-bold underline underline-offset-2 whitespace-nowrap'
								type='button'
							>
								{t("profile.retry") || "Retry"}
							</button>
						</div>
					)}
					<div className='grid grid-cols-3 gap-3 max-h-48 sm:max-h-60 overflow-y-auto pr-1 custom-scrollbar'>
						{availableSlots.length > 0 ? (
							availableSlots.map((time) => {
								// Check for overlap with any existing booking
								// We need to check if the [time, time + duration] overlaps with any [booking.time, booking.time + booking.service.duration]

								const isTaken = !isSlotAvailable(
									time,
									selectedService?.duration || 30,
									bookings,
									selectedDate
								)

								const isBusy = isTaken // Simplify for now

								return (
									<button
										key={time}
										onClick={() => !isTaken && setSelectedTime(time)}
										disabled={isTaken}
										className={clsx(
											"py-2.5 px-1 text-sm font-medium rounded-xl border transition-all duration-200 relative",
											isBusy
												? "bg-red-50 border-red-100 text-red-300 cursor-not-allowed"
												: selectedTime === time
												? "bg-primary-600 text-white border-primary-600 shadow-md"
												: "bg-white border-slate-200 text-slate-700 hover:border-primary-400 hover:text-primary-600 hover:shadow-sm"
										)}
									>
										<span className={clsx(isTaken && "opacity-50 text-xs")}>{time}</span>
										{isBusy && (
											<span className='absolute inset-x-0 bottom-0.5 text-[9px] font-bold uppercase text-red-500 leading-none'>
												{t("profile.busy") || "Busy"}
											</span>
										)}
									</button>
								)
							})
						) : (
							<div className='col-span-3 text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
								{selectedService && selectedDate && !daySchedule
									? t("profile.closed_day") || "This barber is not available on this day."
									: t("profile.no_slots")}
							</div>
						)}
					</div>
				</div>

				{/* Guest Details */}
				{user && (
					<div className='mb-4'>
						<label className='flex items-center gap-2 cursor-pointer select-none'>
							<input
								type='checkbox'
								checked={bookForSomeoneElse}
								onChange={(e) => setBookForSomeoneElse(e.target.checked)}
								className='w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500'
							/>
							<span className='text-sm text-slate-700 font-medium'>
								{t("profile.book_for_someone_else") || "Book for someone else"}
							</span>
						</label>
					</div>
				)}

				{(!user || bookForSomeoneElse) && (
					<div className='mb-6 animate-fade-in'>
						<h3 className='text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2'>
							<User className='w-4 h-4 text-primary-500' />
							{t("auth.guest_details") || "Your Details"}
						</h3>
						<div className='space-y-3'>
							<div>
								<label className='block text-xs font-medium text-slate-700 mb-1'>
									{t("auth.name") || "Name"}
								</label>
								<input
									type='text'
									value={guestName}
									onChange={(e) => setGuestName(e.target.value)}
									placeholder={t("auth.name_placeholder") || "Enter your name"}
									className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm'
								/>
							</div>
							<div>
								<label className='block text-xs font-medium text-slate-700 mb-1'>
									{t("auth.phone") || "Phone Number"}
								</label>
								<input
									type='tel'
									inputMode='numeric'
									value={guestPhone}
									onChange={(e) => setGuestPhone(e.target.value)}
									placeholder={t("auth.phone_placeholder") || "Enter your phone number"}
									className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm'
								/>
							</div>
						</div>
					</div>
				)}
			</div>
			{/* Summary & Action */}
			<div className='sticky bottom-0 bg-white p-4 border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10'>
				{selectedTime &&
					bookings.some(
						(b) =>
							b.date === selectedDate &&
							b.time === selectedTime &&
							(b.status === "pending" || b.status === "upcoming")
					) && (
						<div className='mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800 animate-fade-in'>
							<AlertCircle className='w-4 h-4 flex-shrink-0 text-amber-600' />
							<p>
								{t("profile.pending_warning") ||
									"This slot has a pending request. You can still request it, but availability is not guaranteed."}
							</p>
						</div>
					)}

				<div className='flex items-center gap-4'>
					<div className='flex-shrink-0'>
						<div className='text-xs text-slate-500 font-medium mb-0.5'>
							{t("profile.total_price")}
						</div>
						<div className='text-2xl font-bold text-slate-900 leading-none'>
							{selectedService
								? `${
										selectedService.currency === "AZN" ? "₼" : selectedService.currency
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
						className='btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 text-base font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 rounded-xl'
					>
						{bookingStatus === "submitting" ? (
							<>{t("profile.processing")}</>
						) : (
							<>
								{t("profile.confirm")} <ArrowRight className='w-5 h-5' />
							</>
						)}
					</button>
				</div>
				{barber.phone && (
					<button
						onClick={handleWhatsAppClick}
						className='w-full mt-3 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-green-600 hover:text-green-800 rounded-xl transition-colors'
					>
						<MessageCircle className='w-4 h-4' />
						{t("profile.contact_whatsapp") || "Contact via WhatsApp"}
					</button>
				)}
			</div>
		</div>
	)
}
