import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "../store/authStore"
import { Barber, Service } from "../types"
import { api } from "../services/api"
import {
	User,
	Users,
	LayoutDashboard,
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
	Camera,
	ShieldCheck
} from "lucide-react"
import clsx from "clsx"
import { DashboardStats } from "../components/DashboardStats"
import { ClientList } from "../components/ClientList"
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
		"overview" | "clients" | "profile" | "schedule" | "services" | "portfolio"
	>("overview")
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState<{
		type: "success" | "error"
		text: string
	} | null>(null)

	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
	const [uploading, setUploading] = useState(false)
	const [selectionMode, setSelectionMode] = useState<"avatar" | "preview" | null>(
		null
	)

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
			const updated = await api.barbers.update(barber.id, data)
			setBarber(updated)
			setFormData(updated)
			setMessage({ type: "success", text: t("dashboard.changes_saved") })
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

	const handleSetPreviewImage = (url: string) => {
		const updatedFormData = { ...formData, previewImageUrl: url }
		setFormData(updatedFormData)
		saveBarberData(updatedFormData)
	}

	const updateSchedule = (day: string, field: "start" | "end", value: string) => {
		setFormData((prev) => {
			const currentDay = prev.schedule?.[day] || { start: "09:00", end: "18:00" }

			return {
				...prev,
				schedule: {
					...prev.schedule,
					[day]: {
						...currentDay,
						[field]: value
					}
				}
			}
		})
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
					[day]: { start: "09:00", end: "18:00" }
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
		{ id: "overview", label: t("dashboard.tabs.overview"), icon: LayoutDashboard },
		{ id: "clients", label: t("dashboard.clients.title"), icon: Users },
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

						{/* Overview Tab */}
						{activeTab === "overview" && barber && (
							<DashboardStats barberId={barber.id} />
						)}

						{/* Clients Tab */}
						{activeTab === "clients" && barber && <ClientList barberId={barber.id} />}

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

								{/* Verification Section */}
								<div className='pt-6 border-t border-slate-100'>
									<h3 className='text-lg font-semibold text-slate-900 mb-4'>
										{t("dashboard.profile.verification_title") || "Verification"}
									</h3>

									<div className='bg-slate-50 rounded-xl p-4 border border-slate-200'>
										<div className='flex items-center gap-3 mb-4'>
											<div
												className={clsx(
													"w-10 h-10 rounded-full flex items-center justify-center",
													formData.verificationStatus === "verified"
														? "bg-green-100 text-green-600"
														: formData.verificationStatus === "pending"
														? "bg-yellow-100 text-yellow-600"
														: "bg-slate-200 text-slate-500"
												)}
											>
												{formData.verificationStatus === "verified" ? (
													<Check className='w-5 h-5' />
												) : formData.verificationStatus === "pending" ? (
													<Clock className='w-5 h-5' />
												) : (
													<ShieldCheck className='w-5 h-5' />
												)}
											</div>
											<div>
												<div className='font-bold text-slate-900'>
													{formData.verificationStatus === "verified"
														? t("dashboard.profile.status_verified") || "Verified Account"
														: formData.verificationStatus === "pending"
														? t("dashboard.profile.status_pending") ||
														  "Verification Pending"
														: t("dashboard.profile.status_unverified") ||
														  "Unverified Account"}
												</div>
												<div className='text-sm text-slate-500'>
													{formData.verificationStatus === "verified"
														? t("dashboard.profile.verified_desc") ||
														  "Your account is verified and displays a badge."
														: formData.verificationStatus === "pending"
														? t("dashboard.profile.pending_desc") ||
														  "We are reviewing your documents."
														: t("dashboard.profile.unverified_desc") ||
														  "Upload a document to get verified."}
												</div>
											</div>
										</div>

										{(formData.verificationStatus === "none" ||
											formData.verificationStatus === "rejected" ||
											!formData.verificationStatus) && (
											<div className='space-y-3'>
												<label className='block text-sm font-medium text-slate-700'>
													{t("dashboard.profile.upload_doc") ||
														"Upload ID or Certificate"}
												</label>
												<div className='flex gap-2'>
													<input
														type='text'
														placeholder='https://...'
														value={formData.verificationDocumentUrl || ""}
														onChange={(e) =>
															setFormData({
																...formData,
																verificationDocumentUrl: e.target.value
															})
														}
														className='input-field flex-1'
													/>
													<button
														onClick={() =>
															setFormData({ ...formData, verificationStatus: "pending" })
														}
														disabled={!formData.verificationDocumentUrl}
														className='px-4 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap'
													>
														{t("dashboard.profile.submit_verification") ||
															"Submit Request"}
													</button>
												</div>
												<p className='text-xs text-slate-500'>
													{t("dashboard.profile.upload_hint") ||
														"Please provide a link to your document (Google Drive, Dropbox, etc.)"}
												</p>
											</div>
										)}
									</div>
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
															{formData.schedule?.[day]?.start} -{" "}
															{formData.schedule?.[day]?.end}
														</span>
													)}
												</div>

												{isWorking && (
													<div className='grid grid-cols-2 gap-4'>
														<div>
															<label className='block text-xs font-medium text-slate-500 mb-1'>
																Start Time
															</label>
															<input
																type='time'
																value={formData.schedule?.[day]?.start || "09:00"}
																onChange={(e) =>
																	updateSchedule(day, "start", e.target.value)
																}
																className='input-field py-1 text-sm'
															/>
														</div>
														<div>
															<label className='block text-xs font-medium text-slate-500 mb-1'>
																End Time
															</label>
															<input
																type='time'
																value={formData.schedule?.[day]?.end || "18:00"}
																onChange={(e) =>
																	updateSchedule(day, "end", e.target.value)
																}
																className='input-field py-1 text-sm'
															/>
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
									{(!formData.services || formData.services.length === 0) && (
										<div className='text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200'>
											<Scissors className='w-12 h-12 text-slate-300 mx-auto mb-3' />
											<p className='text-slate-500'>
												{t("dashboard.services.no_services") || "No services added yet."}
											</p>
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
												className='mt-4 text-primary-600 font-medium hover:underline'
											>
												{t("dashboard.services.add_first") || "Add your first service"}
											</button>
										</div>
									)}
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
							<div className='space-y-8'>
								{/* Identity Section */}
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									{/* Avatar Card */}
									<div className='bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center'>
										<h3 className='font-bold text-slate-900 mb-4'>
											{t("dashboard.portfolio.profile_avatar")}
										</h3>
										<div className='relative w-32 h-32 rounded-full overflow-hidden bg-slate-100 mb-4 ring-4 ring-slate-50'>
											{formData.avatarUrl ? (
												<img
													src={formData.avatarUrl}
													alt='Avatar'
													className='w-full h-full object-cover'
												/>
											) : (
												<div className='w-full h-full flex items-center justify-center text-slate-300'>
													<User className='w-12 h-12' />
												</div>
											)}
										</div>
										<p className='text-sm text-slate-500 mb-4'>
											{t("dashboard.portfolio.avatar_desc")}
										</p>
										<button
											onClick={() => setSelectionMode("avatar")}
											className={clsx(
												"btn-secondary w-full",
												selectionMode === "avatar" && "ring-2 ring-primary-500"
											)}
										>
											{selectionMode === "avatar"
												? t("dashboard.portfolio.select_from_gallery")
												: t("dashboard.portfolio.change_avatar")}
										</button>
									</div>

									{/* Listing Cover Card */}
									<div className='bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center'>
										<h3 className='font-bold text-slate-900 mb-4'>
											{t("dashboard.portfolio.listing_cover")}
										</h3>
										<div className='relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 mb-4'>
											{formData.previewImageUrl ? (
												<img
													src={formData.previewImageUrl}
													alt='Cover'
													className='w-full h-full object-cover'
												/>
											) : (
												<div className='w-full h-full flex items-center justify-center text-slate-300'>
													<ImageIcon className='w-12 h-12' />
												</div>
											)}
										</div>
										<p className='text-sm text-slate-500 mb-4'>
											{t("dashboard.portfolio.cover_desc")}
										</p>
										<button
											onClick={() => setSelectionMode("preview")}
											className={clsx(
												"btn-secondary w-full",
												selectionMode === "preview" && "ring-2 ring-primary-500"
											)}
										>
											{selectionMode === "preview"
												? t("dashboard.portfolio.select_from_gallery")
												: t("dashboard.portfolio.change_cover")}
										</button>
									</div>
								</div>

								{/* Gallery Section */}
								<div>
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

									{selectionMode && (
										<div className='bg-primary-50 border border-primary-100 rounded-xl p-4 mb-6 flex items-center justify-between animate-fade-in'>
											<div className='flex items-center gap-3 text-primary-700'>
												<div className='bg-primary-100 p-2 rounded-full'>
													{selectionMode === "avatar" ? (
														<User className='w-5 h-5' />
													) : (
														<ImageIcon className='w-5 h-5' />
													)}
												</div>
												<p className='font-medium'>
													{t("dashboard.portfolio.select_instruction")}{" "}
													{selectionMode === "avatar"
														? t("dashboard.portfolio.avatar")
														: t("dashboard.portfolio.cover_image")}
												</p>
											</div>
											<button
												onClick={() => setSelectionMode(null)}
												className='text-sm font-bold text-primary-700 hover:text-primary-800'
											>
												{t("dashboard.portfolio.cancel_selection")}
											</button>
										</div>
									)}

									<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
										{(!formData.portfolio || formData.portfolio.length === 0) && (
											<div className='col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200'>
												<ImageIcon className='w-12 h-12 text-slate-300 mx-auto mb-3' />
												<p className='text-slate-500'>
													{t("dashboard.portfolio.no_images") ||
														"No images in portfolio."}
												</p>
												<button
													onClick={() => setIsUploadModalOpen(true)}
													className='mt-4 text-primary-600 font-medium hover:underline'
												>
													{t("dashboard.portfolio.upload_first") ||
														"Upload your first image"}
												</button>
											</div>
										)}
										{formData.portfolio?.map((url, index) => {
											const isAvatar = formData.avatarUrl === url
											const isPreview = formData.previewImageUrl === url

											return (
												<div
													key={index}
													onClick={() => {
														if (selectionMode === "avatar") {
															handleSetAvatar(url)
															setSelectionMode(null)
														} else if (selectionMode === "preview") {
															handleSetPreviewImage(url)
															setSelectionMode(null)
														}
													}}
													className={clsx(
														"relative group aspect-square rounded-xl overflow-hidden bg-slate-100 transition-all duration-200",
														selectionMode
															? "cursor-pointer hover:ring-4 hover:ring-primary-300"
															: "",
														isAvatar && "ring-4 ring-primary-500 ring-offset-2",
														isPreview &&
															!isAvatar &&
															"ring-4 ring-indigo-500 ring-offset-2"
													)}
												>
													<img
														src={url}
														alt={`Portfolio ${index + 1}`}
														className='w-full h-full object-cover'
													/>
													
													{/* Badges */}
													<div className='absolute top-2 right-2 flex flex-col gap-2'>
														{isAvatar && (
															<div
																className='bg-primary-500 text-white p-1.5 rounded-full shadow-md z-10'
																title={t("dashboard.portfolio.current_avatar")}
															>
																<User className='w-3 h-3' />
															</div>
														)}
														{isPreview && (
															<div
																className='bg-indigo-500 text-white p-1.5 rounded-full shadow-md z-10'
																title={t("dashboard.portfolio.current_cover")}
															>
																<ImageIcon className='w-3 h-3' />
															</div>
														)}
													</div>

													{/* Hover Actions (Only when not selecting) */}
													{!selectionMode && (
														<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3'>
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
																	t("dashboard.portfolio.delete_tooltip") ||
																	"Delete Image"
																}
															>
																<Trash2 className='w-5 h-5' />
															</button>
														</div>
													)}
												</div>
											)
										})}
									</div>
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
