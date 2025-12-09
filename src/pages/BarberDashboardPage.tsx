import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "../store/authStore"
import { Barber, Service } from "../types"
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
		"profile" | "schedule" | "services" | "portfolio"
	>("profile")
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState<{
		type: "success" | "error"
		text: string
	} | null>(null)

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
															title={t("dashboard.profile.set_as_profile_picture")}
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
														title={t("dashboard.portfolio.upload_new_image")}
													>
														<Plus className='w-5 h-5' />
													</button>
												</div>
												{(formData.portfolio?.length || 0) === 0 && (
													<p className='text-xs text-slate-400 mt-2 italic'>
														{t("dashboard.profile.no_portfolio")}
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
													<div className='space-y-3'>
														<div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2'>
															{Array.from(
																new Set([
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
																	"19:00",
																	...(formData.schedule?.[day] || [])
																])
															)
																.sort()
																.map((time) => {
																	const isSelected =
																		formData.schedule?.[day]?.includes(time)
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
														<div className='flex items-center gap-2'>
															<input
																type='time'
																id={`time-${day}`}
																className='px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-primary-500'
															/>
															<button
																onClick={() => {
																	const input = document.getElementById(
																		`time-${day}`
																	) as HTMLInputElement
																	if (input.value) {
																		const current = formData.schedule?.[day] || []
																		if (!current.includes(input.value)) {
																			updateSchedule(
																				day,
																				[...current, input.value].sort()
																			)
																		}
																		input.value = ""
																	}
																}}
																className='px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors flex items-center gap-1'
															>
																<Plus className='w-3 h-3' />
																{t("dashboard.schedule.add_time") || "Add Time"}
															</button>
														</div>
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
				title={t("dashboard.portfolio.upload_title")}
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
