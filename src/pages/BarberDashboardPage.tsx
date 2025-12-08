import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
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
	CheckCircle,
	Upload,
	Camera
} from "lucide-react"
import clsx from "clsx"
import { Modal } from "../components/Modal"
import { compressImage } from "../utils/imageUtils"

export const BarberDashboardPage = () => {
	const { t } = useTranslation()
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

	const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)
	const [cancelReason, setCancelReason] = useState("")

	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
	const [uploading, setUploading] = useState(false)

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
					text: `${t("dashboard.profile_load_error")}: ${
						error.message || t("dashboard.unknown_error")
					}`
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

	const handleStatusChange = async (
		bookingId: string,
		newStatus: Booking["status"],
		comment?: string
	) => {
		try {
			await api.bookings.updateStatus(bookingId, newStatus, comment)
			setBookings((prev) =>
				prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus, comment } : b))
			)
			setMessage({ type: "success", text: t("dashboard.status_updated") })
			setCancellingBookingId(null)
			setCancelReason("")
		} catch (error) {
			console.error("Failed to update booking status", error)
			setMessage({ type: "error", text: t("dashboard.status_update_error") })
		}
	}

	const saveBarberData = async (data: any) => {
		if (!barber) return
		setSaving(true)
		setMessage(null)
		try {
			const res = await fetch(`/api/barbers/${barber.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			})
			if (res.ok) {
				const updated = await res.json()
				setBarber(updated)
				setFormData(updated)
				setMessage({ type: "success", text: t("dashboard.changes_saved") })
			} else {
				throw new Error("Failed to update")
			}
		} catch (error) {
			setMessage({ type: "error", text: t("dashboard.save_error") })
		} finally {
			setSaving(false)
		}
	}

	const handleSave = () => saveBarberData(formData)

	const handleSetAvatar = (url: string) => {
		const updatedFormData = { ...formData, avatarUrl: url }
		setFormData(updatedFormData)
		saveBarberData(updatedFormData)
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

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		if ((formData.portfolio?.length || 0) >= 6) {
			setMessage({
				type: "error",
				text: t("dashboard.portfolio.limit_reached") || "Maximum 6 images allowed"
			})
			setIsUploadModalOpen(false)
			return
		}

		setUploading(true)
		try {
			const compressedBase64 = await compressImage(file)
			setFormData((prev) => ({
				...prev,
				portfolio: [...(prev.portfolio || []), compressedBase64]
			}))
			setIsUploadModalOpen(false)
			setMessage({ type: "success", text: t("dashboard.portfolio.image_added") })
		} catch (error) {
			console.error("Image upload failed:", error)
			setMessage({ type: "error", text: t("dashboard.portfolio.upload_error") })
		} finally {
			setUploading(false)
		}
	}

	if (loading) return <div className='p-8 text-center'>{t("dashboard.loading")}</div>
	if (!barber)
		return <div className='p-8 text-center'>{t("dashboard.profile_not_found")}</div>

	const tabs = [
		{ id: "profile", label: t("dashboard.tabs.profile"), icon: User },
		{ id: "bookings", label: t("dashboard.tabs.bookings"), icon: List },
		{ id: "schedule", label: t("dashboard.tabs.schedule"), icon: Calendar },
		{ id: "services", label: t("dashboard.tabs.services"), icon: Scissors },
		{ id: "portfolio", label: t("dashboard.tabs.portfolio"), icon: ImageIcon }
	] as const

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-slate-900'>{t("dashboard.title")}</h1>
				<p className='text-slate-500 mt-2'>{t("dashboard.subtitle")}</p>
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
								<h2 className='text-xl font-bold text-slate-900 mb-6'>
									{t("dashboard.bookings.title")}
								</h2>
								{loadingBookings ? (
									<div className='text-center py-12'>
										<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto'></div>
										<p className='text-slate-500 mt-4'>{t("dashboard.loading")}</p>
									</div>
								) : bookings.length === 0 ? (
									<div className='text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
										<Calendar className='w-12 h-12 text-slate-300 mx-auto mb-4' />
										<p className='text-slate-500'>
											{t("dashboard.bookings.no_bookings")}
										</p>
									</div>
								) : (
									<div className='space-y-4'>
										{bookings
											.sort((a, b) => {
												const statusOrder: Record<string, number> = {
													pending: 1,
													upcoming: 2,
													confirmed: 3,
													completed: 4,
													cancelled: 5
												}

												const statusA = statusOrder[a.status] || 99
												const statusB = statusOrder[b.status] || 99

												if (statusA !== statusB) return statusA - statusB

												return (
													new Date(a.date + "T" + a.time).getTime() -
													new Date(b.date + "T" + b.time).getTime()
												)
											})
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
															"p-5 rounded-xl border transition-all flex flex-col gap-4",
															isPast
																? "bg-slate-50 border-slate-100 opacity-75"
																: "bg-white border-slate-200 hover:border-primary-200 hover:shadow-sm"
														)}
													>
														<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
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
																		{client?.name ||
																			t("dashboard.bookings.unknown_client")}
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
																		{service?.name ||
																			t("dashboard.bookings.service_deleted")}
																	</div>
																</div>
															</div>

															<div className='flex items-center gap-3 sm:flex-col sm:items-end'>
																<div className='text-right'>
																	<div className='font-bold text-slate-900'>
																		{service?.currency === "AZN"
																			? "₼"
																			: service?.currency}
																		{service?.price}
																	</div>
																	<div className='text-xs text-slate-500'>
																		{service?.duration} {t("profile.min")}
																	</div>
																</div>
																<div
																	className={clsx(
																		"px-3 py-1 rounded-full text-xs font-bold capitalize",
																		booking.status === "confirmed"
																			? "bg-green-100 text-green-700"
																			: booking.status === "pending" ||
																			  booking.status === "upcoming"
																			? "bg-yellow-100 text-yellow-700"
																			: booking.status === "cancelled"
																			? "bg-red-100 text-red-700"
																			: "bg-slate-100 text-slate-700"
																	)}
																>
																	{booking.status === "confirmed"
																		? t("dashboard.bookings.status.confirmed")
																		: booking.status === "pending" ||
																		  booking.status === "upcoming"
																		? t("dashboard.bookings.status.pending")
																		: booking.status === "cancelled"
																		? t("dashboard.bookings.status.cancelled")
																		: t("dashboard.bookings.status.completed")}
																</div>

																{/* Action Buttons */}
																<div className='flex gap-3 mt-2 w-full justify-end'>
																	{cancellingBookingId === booking.id ? (
																		<div className='flex flex-col gap-2 w-full animate-fade-in'>
																			<input
																				type='text'
																				value={cancelReason}
																				onChange={(e) => setCancelReason(e.target.value)}
																				placeholder={t(
																					"dashboard.bookings.cancel_reason_prompt"
																				)}
																				className='input-field text-sm py-2'
																				autoFocus
																			/>
																			<div className='flex gap-2 justify-end'>
																				<button
																					onClick={() => {
																						setCancellingBookingId(null)
																						setCancelReason("")
																					}}
																					className='px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors'
																				>
																					{t("dashboard.bookings.actions.cancel")}
																				</button>
																				<button
																					onClick={() =>
																						handleStatusChange(
																							booking.id,
																							"cancelled",
																							cancelReason
																						)
																					}
																					className='px-3 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors'
																				>
																					{t("dashboard.bookings.actions.confirm")}
																				</button>
																			</div>
																		</div>
																	) : (
																		<>
																			{(booking.status === "pending" ||
																				booking.status === "upcoming") && (
																				<>
																					<button
																						onClick={() =>
																							handleStatusChange(booking.id, "confirmed")
																						}
																						className='p-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all shadow-sm hover:shadow-md'
																						title={t(
																							"dashboard.bookings.actions.confirm"
																						)}
																					>
																						<Check className='w-6 h-6' />
																					</button>
																					<button
																						onClick={() => {
																							setCancellingBookingId(booking.id)
																							setCancelReason("")
																						}}
																						className='p-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all shadow-sm hover:shadow-md'
																						title={t("dashboard.bookings.actions.cancel")}
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
																						title={t(
																							"dashboard.bookings.actions.complete"
																						)}
																					>
																						<CheckCircle className='w-6 h-6' />
																					</button>
																					<button
																						onClick={() => {
																							setCancellingBookingId(booking.id)
																							setCancelReason("")
																						}}
																						className='p-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all shadow-sm hover:shadow-md'
																						title={t("dashboard.bookings.actions.cancel")}
																					>
																						<X className='w-6 h-6' />
																					</button>
																				</>
																			)}
																		</>
																	)}
																</div>
															</div>
														</div>
														{booking.comment && (
															<div className='mt-4 pt-4 border-t border-slate-100 text-sm bg-slate-50/50 -mx-5 -mb-5 px-5 py-3 rounded-b-xl w-[calc(100%+2.5rem)]'>
																<span className='font-medium text-slate-700'>
																	{t("dashboard.bookings.note") || "Note"}:{" "}
																</span>
																<span className='text-slate-600 italic'>
																	{booking.comment}
																</span>
															</div>
														)}
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
									{t("dashboard.profile.title")}
								</h2>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div className='md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100'>
										<label className='block text-sm font-medium text-slate-700 mb-4'>
											{t("dashboard.profile.profile_picture") || "Profile Picture"}
										</label>
										<div className='flex flex-col sm:flex-row items-start sm:items-center gap-8'>
											{/* Current Avatar */}
											<div className='relative group'>
												<div className='w-24 h-24 rounded-full bg-white overflow-hidden border-4 border-white shadow-lg ring-1 ring-slate-100'>
													{formData.avatarUrl ? (
														<img
															src={formData.avatarUrl}
															alt='Profile'
															className='w-full h-full object-cover'
														/>
													) : (
														<div className='w-full h-full flex items-center justify-center text-slate-300 bg-slate-50'>
															<User className='w-10 h-10' />
														</div>
													)}
												</div>
												<div className='absolute bottom-0 right-0 bg-primary-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm'>
													<Camera className='w-4 h-4' />
												</div>
											</div>

											{/* Portfolio Selection */}
											<div className='flex-1'>
												<p className='text-sm text-slate-500 mb-3 font-medium'>
													{t("dashboard.profile.select_from_portfolio") ||
														"Select from portfolio:"}
												</p>
												<div className='flex flex-wrap gap-3'>
													{formData.portfolio?.map((url, index) => (
														<button
															key={index}
															onClick={() => handleSetAvatar(url)}
															className={clsx(
																"w-12 h-12 rounded-full overflow-hidden border-2 transition-all relative",
																formData.avatarUrl === url
																	? "border-primary-500 ring-2 ring-primary-200 ring-offset-2"
																	: "border-slate-200 hover:border-primary-300 hover:scale-105"
															)}
															title='Set as Profile Picture'
														>
															<img
																src={url}
																alt={`Portfolio ${index + 1}`}
																className='w-full h-full object-cover'
															/>
															{formData.avatarUrl === url && (
																<div className='absolute inset-0 bg-primary-500/20 flex items-center justify-center'>
																	<Check className='w-5 h-5 text-white drop-shadow-md' />
																</div>
															)}
														</button>
													))}
													<button
														onClick={() => setIsUploadModalOpen(true)}
														disabled={(formData.portfolio?.length || 0) >= 6}
														className='w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-300 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
														title='Upload New Image'
													>
														<Plus className='w-5 h-5' />
													</button>
												</div>
												{(formData.portfolio?.length || 0) === 0 && (
													<p className='text-xs text-slate-400 mt-2 italic'>
														{t("dashboard.profile.no_portfolio") ||
															"Upload images to your portfolio to set them as your profile picture."}
													</p>
												)}
											</div>
										</div>
									</div>

									<div>
										<label className='block text-sm font-medium text-slate-700 mb-1'>
											{t("dashboard.profile.name")}
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
											{t("dashboard.profile.email")}
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
											{t("dashboard.profile.phone")}
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
											{t("dashboard.profile.address")}
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
										{t("dashboard.profile.about")}
									</label>
									<textarea
										rows={4}
										value={formData.bio || ""}
										onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
										className='input-field'
										placeholder={t("dashboard.profile.about_placeholder")}
									/>
								</div>

								<div>
									<label className='block text-sm font-medium text-slate-700 mb-1'>
										{t("dashboard.profile.specialties")}
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
										placeholder={t("dashboard.profile.specialties_placeholder")}
									/>
								</div>
							</div>
						)}

						{/* Schedule Tab */}
						{activeTab === "schedule" && (
							<div className='space-y-6'>
								<h2 className='text-xl font-bold text-slate-900 mb-6'>
									{t("dashboard.schedule.title")}
								</h2>
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
											Monday: t("dashboard.schedule.days.monday"),
											Tuesday: t("dashboard.schedule.days.tuesday"),
											Wednesday: t("dashboard.schedule.days.wednesday"),
											Thursday: t("dashboard.schedule.days.thursday"),
											Friday: t("dashboard.schedule.days.friday"),
											Saturday: t("dashboard.schedule.days.saturday"),
											Sunday: t("dashboard.schedule.days.sunday")
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
															{formData.schedule?.[day]?.length}{" "}
															{t("dashboard.schedule.hours_active")}
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
										{t("dashboard.schedule.holidays.title")}
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
											{t("dashboard.schedule.holidays.add")}
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
												{t("dashboard.schedule.holidays.no_holidays")}
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
									<h2 className='text-xl font-bold text-slate-900'>
										{t("dashboard.services.title")}
									</h2>
									<button
										onClick={() => {
											const newService: Service = {
												id: "s" + Date.now(),
												name: t("dashboard.services.new_service_default"),
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
										{t("dashboard.services.add_service")}
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
													<label className='text-xs text-slate-500 mb-1 block'>
														{t("dashboard.services.name")}
													</label>
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
														{t("dashboard.services.duration")}
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
														{t("dashboard.services.price")}
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
									<h2 className='text-xl font-bold text-slate-900'>
										{t("dashboard.portfolio.title")}
									</h2>
									<button
										onClick={() => setIsUploadModalOpen(true)}
										disabled={(formData.portfolio?.length || 0) >= 6}
										className='btn-secondary py-2 px-4 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
									>
										<Plus className='w-4 h-4' />
										{t("dashboard.portfolio.add_image")}
									</button>
								</div>

								<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
									{formData.portfolio?.map((url, index) => {
										// Compare lengths or use a more robust comparison if base64 strings are slightly different
										// But usually exact match should work. Let's try to debug by logging or ensuring state update.
										// The issue might be that formData.avatarUrl is not updated immediately or reference issue.
										// However, let's ensure we are comparing strings.
										const isAvatar = formData.avatarUrl === url

										return (
											<div
												key={index}
												className={clsx(
													"relative group aspect-square rounded-xl overflow-hidden bg-slate-100",
													isAvatar && "ring-4 ring-primary-500 ring-offset-2"
												)}
											>
												<img
													src={url}
													alt={`Portfolio ${index + 1}`}
													className='w-full h-full object-cover'
												/>
												{isAvatar && (
													<div className='absolute top-2 right-2 bg-primary-500 text-white p-1 rounded-full shadow-md z-10'>
														<Check className='w-4 h-4' />
													</div>
												)}
												<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3'>
													<button
														onClick={(e) => {
															e.stopPropagation() // Prevent bubbling
															handleSetAvatar(url)
														}}
														className={clsx(
															"p-2 rounded-full transition-colors",
															isAvatar
																? "bg-primary-500 text-white cursor-default"
																: "bg-white text-primary-600 hover:bg-primary-50"
														)}
														title={
															isAvatar
																? t("dashboard.portfolio.current_avatar_tooltip") ||
																  "Current Profile Picture"
																: t("dashboard.portfolio.set_avatar_tooltip") ||
																  "Set as Profile Picture"
														}
														disabled={isAvatar}
													>
														<User className='w-5 h-5' />
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation()
															const newPortfolio = formData.portfolio?.filter(
																(_, i) => i !== index
															)
															setFormData({
																...formData,
																portfolio: newPortfolio
															})
														}}
														className='p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors'
														title={
															t("dashboard.portfolio.delete_tooltip") || "Delete Image"
														}
													>
														<Trash2 className='w-5 h-5' />
													</button>
												</div>
											</div>
										)
									})}
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
									t("dashboard.saving")
								) : (
									<>
										<Save className='w-4 h-4' />
										{t("dashboard.save")}
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>

			<Modal
				isOpen={isUploadModalOpen}
				onClose={() => setIsUploadModalOpen(false)}
				title={t("dashboard.portfolio.upload_title") || "Upload Image"}
			>
				<div className='space-y-4'>
					<div className='border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer relative'>
						<input
							type='file'
							accept='image/*'
							onChange={handleImageUpload}
							className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
							disabled={uploading}
						/>
						<div className='flex flex-col items-center gap-2 text-slate-500'>
							{uploading ? (
								<>
									<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600'></div>
									<p className='text-sm font-medium'>
										{t("dashboard.portfolio.compressing") || "Compressing..."}
									</p>
								</>
							) : (
								<>
									<Upload className='w-8 h-8 text-slate-400' />
									<p className='text-sm font-medium'>
										{t("dashboard.portfolio.click_to_upload") || "Click to upload image"}
									</p>
									<p className='text-xs text-slate-400'>
										{t("dashboard.portfolio.upload_help") || "JPG, PNG (Max 800x800px)"}
									</p>
								</>
							)}
						</div>
					</div>
				</div>
			</Modal>
		</div>
	)
}
