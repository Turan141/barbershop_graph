import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { enUS, ru, az } from "date-fns/locale"
import { Check, ChevronDown, Clock, Scissors, ArrowRight } from "lucide-react"
import clsx from "clsx"
import { Barber, Service } from "../types"
import { api } from "../services/api"
import { useAuthStore } from "../store/authStore"

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
	const navigate = useNavigate()
	const { user } = useAuthStore()

	const [selectedDate, setSelectedDate] = useState<string>("")
	const [selectedTime, setSelectedTime] = useState<string>("")
	const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false)
	const [bookingStatus, setBookingStatus] = useState<
		"idle" | "submitting" | "success" | "error"
	>("idle")

	const handleBook = async () => {
		if (!user) return navigate("/login")
		if (!selectedService || !selectedDate || !selectedTime || !barber.id) return

		setBookingStatus("submitting")
		try {
			await api.bookings.create({
				barberId: barber.id,
				clientId: user.id,
				serviceId: selectedService.id,
				date: selectedDate,
				time: selectedTime
			})
			setBookingStatus("success")
			if (onSuccess) onSuccess()
		} catch (error) {
			setBookingStatus("error")
		}
	}

	// Generate next 7 days for calendar
	const dates = Array.from({ length: 7 }, (_, i) => {
		const d = new Date()
		d.setDate(d.getDate() + i)
		const currentLocale = locales[i18n.language] || enUS
		return {
			label: format(d, "EEE, d", { locale: currentLocale }),
			fullLabel: format(d, "EEEE, d MMMM", { locale: currentLocale }),
			value: d.toISOString().split("T")[0],
			dayName: format(d, "EEEE", { locale: enUS }) // Keep en-US for schedule lookup
		}
	})

	const availableSlots = selectedDate
		? barber.schedule[dates.find((d) => d.value === selectedDate)?.dayName || ""] || []
		: []

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
		<div className='space-y-8'>
			{/* Service Selection */}
			<div>
				<label className='block text-sm font-bold text-slate-900 mb-4'>
					{t("profile.select_service")}
				</label>
				<div className='relative'>
					<button
						onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
						className='w-full p-4 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium text-slate-900 flex items-center justify-between transition-all hover:border-primary-300'
					>
						<span
							className={clsx(
								"truncate mr-2",
								!selectedService && "text-slate-500 font-normal"
							)}
						>
							{selectedService ? (
								<>
									{selectedService.name}
									<span className='mx-2 text-slate-300'>|</span>
									<span className='text-primary-600'>
										{selectedService.currency === "AZN" ? "₼" : selectedService.currency}
										{selectedService.price}
									</span>
								</>
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
				<label className='block text-sm font-bold text-slate-900 mb-4 flex items-center justify-between'>
					{t("profile.select_date")}
					<span className='text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full'>
						{dates[0].fullLabel}
					</span>
				</label>
				<div className='flex gap-3 overflow-x-auto py-4 scrollbar-hide -mx-2 px-2'>
					{dates.map((d) => (
						<button
							key={d.value}
							onClick={() => {
								setSelectedDate(d.value)
								setSelectedTime("")
							}}
							className={clsx(
								"flex-shrink-0 w-16 h-24 rounded-2xl flex flex-col items-center justify-center border transition-all duration-300",
								selectedDate === d.value
									? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/30 scale-105"
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
					(!selectedDate || !selectedService) && "opacity-50 pointer-events-none blur-sm"
				)}
			>
				<label className='block text-sm font-bold text-slate-900 mb-4'>
					{t("profile.available_times")}{" "}
					{selectedDate && (
						<span className='font-normal text-slate-500 ml-2'>
							- {dates.find((d) => d.value === selectedDate)?.fullLabel}
						</span>
					)}
				</label>
				<div className='grid grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar'>
					{availableSlots.length > 0 ? (
						availableSlots.map((time) => (
							<button
								key={time}
								onClick={() => setSelectedTime(time)}
								className={clsx(
									"py-2.5 px-1 text-sm font-medium rounded-xl border transition-all duration-200",
									selectedTime === time
										? "bg-primary-600 text-white border-primary-600 shadow-md scale-105"
										: "bg-white border-slate-200 text-slate-700 hover:border-primary-400 hover:text-primary-600 hover:shadow-sm"
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
				<div className='flex justify-between items-end mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100'>
					<div className='text-sm text-slate-500 font-medium'>
						{t("profile.total_price")}
					</div>
					<div className='text-3xl font-bold text-slate-900'>
						{selectedService
							? `${selectedService.currency === "AZN" ? "₼" : selectedService.currency}${
									selectedService.price
							  }`
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
					className='btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40'
				>
					{bookingStatus === "submitting" ? (
						<>{t("profile.processing")}</>
					) : (
						<>
							{t("profile.confirm")} <ArrowRight className='w-5 h-5' />
						</>
					)}
				</button>

				{bookingStatus === "error" && (
					<p className='text-red-500 text-sm text-center mt-3 bg-red-50 py-2 rounded-lg border border-red-100 animate-shake'>
						{t("profile.slot_taken")}
					</p>
				)}
			</div>
		</div>
	)
}
