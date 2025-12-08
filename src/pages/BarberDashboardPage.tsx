import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { Barber, Service, Booking, User as UserType } from "../types"
import { api } from "../services/api"
import {
	User,
	Calendar,
	Scissors,
	Image as ImageIcon,
	Save,
	Plus,
	Trash2,
	Clock,
	MapPin,
	Phone,
	Mail,
	Check,
	List,
	X,
	CheckCircle
} from "lucide-react"
import clsx from "clsx"

export const BarberDashboardPage = () => {
	const { user } = useAuthStore()
	const navigate = useNavigate()

	useEffect(() => {
		if (user?.role !== "barber") {
			navigate("/")
		}
	}, [user, navigate])

	const [barber, setBarber] = useState<Barber | null>(null)
	const [loading, setLoading] = useState(true)
	const [activeTab, setActiveTab] = useState<
		"profile" | "schedule" | "services" | "portfolio" | "bookings"
	>("bookings")
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState<{
		type: "success" | "error"
		text: string
	} | null>(null)

	// Bookings state
	const [bookings, setBookings] = useState<Booking[]>([])
	const [clients, setClients] = useState<Record<string, UserType>>({})
	const [loadingBookings, setLoadingBookings] = useState(false)

	// Form states
	const [formData, setFormData] = useState<Partial<Barber>>({})

	useEffect(() => {
		const fetchBarber = async () => {
			if (!user) return
			try {
				// Use the api service which handles the base URL correctly
				const data = await api.barbers.get(user.id)
				setBarber(data)
				setFormData(data)
			} catch (error: any) {
				console.error("Failed to fetch barber profile", error)
				setMessage({
					type: "error",
					text: `Profil yüklənmədi: ${error.message || "Naməlum xəta"}`
				})
			} finally {
				setLoading(false)
			}
		}
		fetchBarber()
	}, [user])

	useEffect(() => {
		const fetchBookings = async () => {
			if (!user || activeTab !== "bookings") return
			setLoadingBookings(true)
			try {
				const data = await api.bookings.listForBarber(user.id)
				setBookings(data)

				// Fetch client details
				const clientIds = Array.from(new Set(data.map((b) => b.clientId)))
				const clientsData: Record<string, UserType> = {}

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
			} catch (error) {
				console.error("Failed to fetch bookings", error)
			} finally {
				setLoadingBookings(false)
			}
		}
		fetchBookings()
	}, [user, activeTab])

	const handleStatusChange = async (bookingId: string, newStatus: Booking["status"]) => {
		try {
			await api.bookings.updateStatus(bookingId, newStatus)
			setBookings((prev) =>
				prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
			)
			setMessage({ type: "success", text: "Randevu statusu yeniləndi" })
		} catch (error) {
			console.error("Failed to update booking status", error)
			setMessage({ type: "error", text: "Status yenilənərkən xəta baş verdi" })
		}
	}

	const handleSave = async () => {
		if (!barber) return
		setSaving(true)
		setMessage(null)
		try {
			const res = await fetch(`/api/barbers/${barber.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData)
			})
			if (res.ok) {
				const updated = await res.json()
				setBarber(updated)
				setMessage({ type: "success", text: "Dəyişikliklər yadda saxlanıldı!" })
			} else {
				throw new Error("Failed to update")
			}
		} catch (error) {
			setMessage({ type: "error", text: "Xəta baş verdi. Yenidən cəhd edin." })
		} finally {
			setSaving(false)
		}
	}

	const updateSchedule = (day: string, slots: string[]) => {
		setFormData((prev) => ({
			...prev,
			schedule: {
				...prev.schedule,
				[day]: slots
			}
		}))
	}

	const toggleDay = (day: string) => {
		const currentSchedule = formData.schedule || {}
		if (currentSchedule[day]) {
			const newSchedule = { ...currentSchedule }
			delete newSchedule[day]
			setFormData({ ...formData, schedule: newSchedule })
		} else {
			// Default hours
			setFormData({
				...formData,
				schedule: {
					...currentSchedule,
					[day]: [
						"09:00",
						"10:00",
						"11:00",
						"12:00",
						"13:00",
						"14:00",
						"15:00",
						"16:00",
						"17:00"
					]
				}
			})
		}
	}

	if (loading) return <div className='p-8 text-center'>Yüklənir...</div>
	if (!barber) return <div className='p-8 text-center'>Bərbər profili tapılmadı.</div>

	const tabs = [
		{ id: "profile", label: "Profil Məlumatları", icon: User },
		{ id: "bookings", label: "Randevular", icon: List },
		{ id: "schedule", label: "İş Saatları", icon: Calendar },
		{ id: "services", label: "Xidmətlər", icon: Scissors },
		{ id: "portfolio", label: "Portfolio", icon: ImageIcon }
	] as const

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-slate-900'>İdarə Paneli</h1>
				<p className='text-slate-500 mt-2'>Profilinizi və iş qrafikinizi idarə edin</p>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
				{/* Sidebar Navigation */}
				<div className='lg:col-span-3'>
					<nav className='space-y-1'>
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={clsx(
									"w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
									activeTab === tab.id
										? "bg-primary-50 text-primary-700"
										: "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
								)}
							>
								<tab.icon className='w-5 h-5' />
								{tab.label}
							</button>
						))}
					</nav>
				</div>

				{/* Main Content */}
				<div className='lg:col-span-9'>
					<div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8'>
						{message && (
							<div
								className={clsx(
									"mb-6 p-4 rounded-xl flex items-center gap-2",
									message.type === "success"
										? "bg-green-50 text-green-700 border border-green-100"
										: "bg-red-50 text-red-700 border border-red-100"
								)}
							>
								{message.type === "success" ? (
									<Check className='w-5 h-5' />
								) : (
									<div className='w-5 h-5' />
								)}
								{message.text}
							</div>
						)}

						{/* Bookings Tab */}
						{activeTab === "bookings" && (
							<div className='space-y-6'>
								<h2 className='text-xl font-bold text-slate-900 mb-6'>Randevular</h2>
								{loadingBookings ? (
									<div className='text-center py-12'>
										<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto'></div>
										<p className='text-slate-500 mt-4'>Yüklənir...</p>
									</div>
								) : bookings.length === 0 ? (
									<div className='text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
										<Calendar className='w-12 h-12 text-slate-300 mx-auto mb-4' />
										<p className='text-slate-500'>Hələ ki, heç bir randevunuz yoxdur.</p>
									</div>
								) : (
									<div className='space-y-4'>
										{bookings
											.sort(
												(a, b) =>
													new Date(a.date + "T" + a.time).getTime() -
													new Date(b.date + "T" + b.time).getTime()
											)
											.map((booking) => {
												const client = clients[booking.clientId]
												const service = barber?.services.find(
													(s) => s.id === booking.serviceId
												)
												const isPast =
													new Date(booking.date + "T" + booking.time) < new Date()

												return (
													<div
														key={booking.id}
														className={clsx(
															"p-5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4",
															isPast
																? "bg-slate-50 border-slate-100 opacity-75"
																: "bg-white border-slate-200 hover:border-primary-200 hover:shadow-sm"
														)}
													>
														<div className='flex items-start gap-4'>
															<div className='w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden'>
																{client?.avatarUrl ? (
																	<img
																		src={client.avatarUrl}
																		alt={client.name}
																		className='w-full h-full object-cover'
																	/>
																) : (
																	<User className='w-6 h-6 text-slate-400' />
																)}
															</div>
															<div>
																<h3 className='font-bold text-slate-900'>
																	{client?.name || "Naməlum Müştəri"}
																</h3>
																<div className='flex items-center gap-2 text-sm text-slate-500 mt-1'>
																	<span className='flex items-center gap-1'>
																		<Calendar className='w-3.5 h-3.5' />
																		{booking.date}
																	</span>
																	<span className='w-1 h-1 rounded-full bg-slate-300'></span>
																	<span className='flex items-center gap-1'>
																		<Clock className='w-3.5 h-3.5' />
																		{booking.time}
																	</span>
																</div>
																<div className='mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary-50 text-primary-700 text-xs font-medium'>
																	<Scissors className='w-3 h-3' />
																	{service?.name || "Xidmət silinib"}
																</div>
															</div>
														</div>

														<div className='flex items-center gap-3 sm:flex-col sm:items-end'>
															<div className='text-right'>
																<div className='font-bold text-slate-900'>
																	{service?.currency === "AZN" ? "₼" : service?.currency}
																	{service?.price}
																</div>
																<div className='text-xs text-slate-500'>
																	{service?.duration} dəq
																</div>
															</div>
															<div
																className={clsx(
																	"px-3 py-1 rounded-full text-xs font-bold capitalize",
																	booking.status === "confirmed"
																		? "bg-green-100 text-green-700"
																		: booking.status === "pending"
																		? "bg-yellow-100 text-yellow-700"
																		: booking.status === "cancelled"
																		? "bg-red-100 text-red-700"
																		: "bg-slate-100 text-slate-700"
																)}
															>
																{booking.status === "confirmed"
																	? "Təsdiqlənib"
																	: booking.status === "pending"
																	? "Gözləyir"
																	: booking.status === "cancelled"
																	? "Ləğv edilib"
																	: "Tamamlanıb"}
															</div>

															{/* Action Buttons */}
															<div className='flex gap-3 mt-2'>
																{booking.status === "pending" && (
																	<>
																		<button
																			onClick={() =>
																				handleStatusChange(booking.id, "confirmed")
																			}
																			className='p-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all shadow-sm hover:shadow-md'
																			title='Təsdiqlə'
																		>
																			<Check className='w-6 h-6' />
																		</button>
																		<button
																			onClick={() =>
																				handleStatusChange(booking.id, "cancelled")
																			}
																			className='p-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all shadow-sm hover:shadow-md'
																			title='Ləğv et'
																		>
																			<X className='w-6 h-6' />
																		</button>
																	</>
																)}
																{booking.status === "confirmed" && (
																	<>
																		<button
																			onClick={() =>
																				handleStatusChange(booking.id, "completed")
																			}
																			className='p-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all shadow-sm hover:shadow-md'
																			title='Tamamla'
																		>
																			<CheckCircle className='w-6 h-6' />
																		</button>
																		<button
																			onClick={() =>
																				handleStatusChange(booking.id, "cancelled")
																			}
																			className='p-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all shadow-sm hover:shadow-md'
																			title='Ləğv et'
																		>
																			<X className='w-6 h-6' />
																		</button>
																	</>
																)}
															</div>
														</div>
													</div>
												)
											})}
									</div>
								)}
							</div>
						)}

						{/* Profile Tab */}
						{activeTab === "profile" && (
							<div className='space-y-6'>
								<h2 className='text-xl font-bold text-slate-900 mb-6'>
									Şəxsi Məlumatlar
								</h2>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div>
										<label className='block text-sm font-medium text-slate-700 mb-1'>
											Ad Soyad
										</label>
										<input
											type='text'
											value={formData.name || ""}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											className='input-field'
										/>
									</div>
									<div>
										<label className='block text-sm font-medium text-slate-700 mb-1'>
											Email
										</label>
										<div className='relative'>
											<Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400' />
											<input
												type='email'
												value={formData.email || ""}
												disabled
												className='input-field pl-10 bg-slate-50'
											/>
										</div>
									</div>
									<div>
										<label className='block text-sm font-medium text-slate-700 mb-1'>
											Telefon
										</label>
										<div className='relative'>
											<Phone className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400' />
											<input
												type='tel'
												value={formData.phone || ""}
												onChange={(e) =>
													setFormData({ ...formData, phone: e.target.value })
												}
												placeholder='+994 50 000 00 00'
												className='input-field pl-10'
											/>
										</div>
									</div>
									<div>
										<label className='block text-sm font-medium text-slate-700 mb-1'>
											Ünvan
										</label>
										<div className='relative'>
											<MapPin className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400' />
											<input
												type='text'
												value={formData.location || ""}
												onChange={(e) =>
													setFormData({ ...formData, location: e.target.value })
												}
												className='input-field pl-10'
											/>
										</div>
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-slate-700 mb-1'>
										Haqqında
									</label>
									<textarea
										rows={4}
										value={formData.bio || ""}
										onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
										className='input-field'
										placeholder='Təcrübəniz və xidmətləriniz haqqında qısa məlumat...'
									/>
								</div>

								<div>
									<label className='block text-sm font-medium text-slate-700 mb-1'>
										İxtisaslar (Vergüllə ayırın)
									</label>
									<input
										type='text'
										value={formData.specialties?.join(", ") || ""}
										onChange={(e) =>
											setFormData({
												...formData,
												specialties: e.target.value.split(",").map((s) => s.trim())
											})
										}
										className='input-field'
										placeholder='Fade, Saqqal, Klassik...'
									/>
								</div>
							</div>
						)}

						{/* Schedule Tab */}
						{activeTab === "schedule" && (
							<div className='space-y-6'>
								<h2 className='text-xl font-bold text-slate-900 mb-6'>İş Qrafiki</h2>
								<div className='space-y-4'>
									{[
										"Monday",
										"Tuesday",
										"Wednesday",
										"Thursday",
										"Friday",
										"Saturday",
										"Sunday"
									].map((day) => {
										const isWorking = !!formData.schedule?.[day]
										const dayLabels: Record<string, string> = {
											Monday: "Bazar ertəsi",
											Tuesday: "Çərşənbə axşamı",
											Wednesday: "Çərşənbə",
											Thursday: "Cümə axşamı",
											Friday: "Cümə",
											Saturday: "Şənbə",
											Sunday: "Bazar"
										}

										return (
											<div
												key={day}
												className={clsx(
													"p-4 rounded-xl border transition-all",
													isWorking
														? "bg-white border-slate-200"
														: "bg-slate-50 border-slate-100 opacity-75"
												)}
											>
												<div className='flex items-center justify-between mb-4'>
													<div className='flex items-center gap-3'>
														<div
															className={clsx(
																"w-10 h-6 rounded-full relative cursor-pointer transition-colors",
																isWorking ? "bg-primary-600" : "bg-slate-300"
															)}
															onClick={() => toggleDay(day)}
														>
															<div
																className={clsx(
																	"absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
																	isWorking ? "left-5" : "left-1"
																)}
															/>
														</div>
														<span className='font-medium text-slate-900'>
															{dayLabels[day]}
														</span>
													</div>
													{isWorking && (
														<span className='text-sm text-slate-500'>
															{formData.schedule?.[day]?.length} saat aktiv
														</span>
													)}
												</div>

												{isWorking && (
													<div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2'>
														{[
															"09:00",
															"10:00",
															"11:00",
															"12:00",
															"13:00",
															"14:00",
															"15:00",
															"16:00",
															"17:00",
															"18:00",
															"19:00"
														].map((time) => {
															const isSelected = formData.schedule?.[day]?.includes(time)
															return (
																<button
																	key={time}
																	onClick={() => {
																		const current = formData.schedule?.[day] || []
																		const newSlots = isSelected
																			? current.filter((t) => t !== time)
																			: [...current, time].sort()
																		updateSchedule(day, newSlots)
																	}}
																	className={clsx(
																		"px-2 py-1 text-xs font-medium rounded border transition-colors",
																		isSelected
																			? "bg-primary-50 text-primary-700 border-primary-200"
																			: "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
																	)}
																>
																	{time}
																</button>
															)
														})}
													</div>
												)}
											</div>
										)
									})}
								</div>

								{/* Holidays Section */}
								<div className='pt-6 border-t border-slate-100'>
									<h3 className='text-lg font-semibold text-slate-900 mb-4'>
										Qeyri-iş Günləri (Bayramlar)
									</h3>
									<div className='flex gap-2 mb-4'>
										<input
											type='date'
											id='holiday-picker'
											className='input-field w-auto'
										/>
										<button
											onClick={() => {
												const input = document.getElementById(
													"holiday-picker"
												) as HTMLInputElement
												if (input.value) {
													const current = formData.holidays || []
													if (!current.includes(input.value)) {
														setFormData({
															...formData,
															holidays: [...current, input.value].sort()
														})
														input.value = ""
													}
												}
											}}
											className='btn-secondary'
										>
											Əlavə et
										</button>
									</div>
									<div className='flex flex-wrap gap-2'>
										{formData.holidays?.map((date) => (
											<div
												key={date}
												className='flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100'
											>
												<span className='text-sm font-medium'>{date}</span>
												<button
													onClick={() => {
														setFormData({
															...formData,
															holidays: formData.holidays?.filter((d) => d !== date)
														})
													}}
													className='hover:text-red-900'
												>
													<Trash2 className='w-4 h-4' />
												</button>
											</div>
										))}
										{(!formData.holidays || formData.holidays.length === 0) && (
											<p className='text-sm text-slate-500 italic'>
												Heç bir xüsusi qeyri-iş günü əlavə edilməyib.
											</p>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Services Tab */}
						{activeTab === "services" && (
							<div className='space-y-6'>
								<div className='flex justify-between items-center mb-6'>
									<h2 className='text-xl font-bold text-slate-900'>Xidmətlər</h2>
									<button
										onClick={() => {
											const newService: Service = {
												id: "s" + Date.now(),
												name: "Yeni Xidmət",
												duration: 30,
												price: 10,
												currency: "AZN"
											}
											setFormData({
												...formData,
												services: [...(formData.services || []), newService]
											})
										}}
										className='btn-secondary py-2 px-4 text-sm flex items-center gap-2'
									>
										<Plus className='w-4 h-4' />
										Xidmət əlavə et
									</button>
								</div>

								<div className='space-y-4'>
									{formData.services?.map((service, index) => (
										<div
											key={service.id}
											className='p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row gap-4 items-start sm:items-center'
										>
											<div className='flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4 w-full'>
												<div>
													<label className='text-xs text-slate-500 mb-1 block'>Ad</label>
													<input
														type='text'
														value={service.name}
														onChange={(e) => {
															const newServices = [...(formData.services || [])]
															newServices[index] = { ...service, name: e.target.value }
															setFormData({ ...formData, services: newServices })
														}}
														className='input-field py-1.5 text-sm'
													/>
												</div>
												<div>
													<label className='text-xs text-slate-500 mb-1 block'>
														Müddət (dəq)
													</label>
													<div className='relative'>
														<Clock className='absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400' />
														<input
															type='number'
															value={service.duration}
															onChange={(e) => {
																const newServices = [...(formData.services || [])]
																newServices[index] = {
																	...service,
																	duration: parseInt(e.target.value)
																}
																setFormData({ ...formData, services: newServices })
															}}
															className='input-field py-1.5 pl-7 text-sm'
														/>
													</div>
												</div>
												<div>
													<label className='text-xs text-slate-500 mb-1 block'>
														Qiymət (AZN)
													</label>
													<input
														type='number'
														value={service.price}
														onChange={(e) => {
															const newServices = [...(formData.services || [])]
															newServices[index] = {
																...service,
																price: parseInt(e.target.value)
															}
															setFormData({ ...formData, services: newServices })
														}}
														className='input-field py-1.5 text-sm'
													/>
												</div>
											</div>
											<button
												onClick={() => {
													const newServices = formData.services?.filter(
														(_, i) => i !== index
													)
													setFormData({ ...formData, services: newServices })
												}}
												className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-4 sm:mt-0'
											>
												<Trash2 className='w-5 h-5' />
											</button>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Portfolio Tab */}
						{activeTab === "portfolio" && (
							<div className='space-y-6'>
								<div className='flex justify-between items-center mb-6'>
									<h2 className='text-xl font-bold text-slate-900'>Portfolio</h2>
									<button
										onClick={() => {
											const url = prompt("Şəkil URL-i daxil edin:")
											if (url) {
												setFormData({
													...formData,
													portfolio: [...(formData.portfolio || []), url]
												})
											}
										}}
										className='btn-secondary py-2 px-4 text-sm flex items-center gap-2'
									>
										<Plus className='w-4 h-4' />
										Şəkil əlavə et
									</button>
								</div>

								<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
									{formData.portfolio?.map((url, index) => (
										<div
											key={index}
											className='relative group aspect-square rounded-xl overflow-hidden bg-slate-100'
										>
											<img
												src={url}
												alt={`Portfolio ${index + 1}`}
												className='w-full h-full object-cover'
											/>
											<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
												<button
													onClick={() => {
														const newPortfolio = formData.portfolio?.filter(
															(_, i) => i !== index
														)
														setFormData({ ...formData, portfolio: newPortfolio })
													}}
													className='p-2 bg-white text-red-500 rounded-full hover:bg-red-50'
												>
													<Trash2 className='w-5 h-5' />
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Save Button */}
						<div className='mt-8 pt-6 border-t border-slate-100 flex justify-end'>
							<button
								onClick={handleSave}
								disabled={saving}
								className='btn-primary flex items-center gap-2 px-8'
							>
								{saving ? (
									"Yadda saxlanılır..."
								) : (
									<>
										<Save className='w-4 h-4' />
										Yadda saxla
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
