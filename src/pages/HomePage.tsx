import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { api } from "../services/api"
import { Barber } from "../types"
import { Star, MapPin, Search, Scissors, QrCode, Filter, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "../store/authStore"
import { BarberDashboardPage } from "./BarberDashboardPage"
import clsx from "clsx"

export const HomePage = () => {
	const { user } = useAuthStore()
	const [barbers, setBarbers] = useState<Barber[]>([])
	const [search, setSearch] = useState("")
	const [loading, setLoading] = useState(true)
	const { t } = useTranslation()

	// Filters
	const [selectedLocation, setSelectedLocation] = useState("")
	const [selectedCategory, setSelectedCategory] = useState("")
	const [priceLevel, setPriceLevel] = useState<"all" | "low" | "medium" | "high">("all")
	const [minRating, setMinRating] = useState(0)
	const [showFilters, setShowFilters] = useState(false)

	if (user?.role === "barber") {
		return <BarberDashboardPage />
	}

	useEffect(() => {
		const fetchBarbers = async () => {
			setLoading(true)
			try {
				const data = await api.barbers.list(search)
				setBarbers(data)
			} catch (error) {
				console.error(error)
			} finally {
				setLoading(false)
			}
		}

		const debounce = setTimeout(fetchBarbers, 300)
		return () => clearTimeout(debounce)
	}, [search])

	// Derived Data for Filters
	const locations = useMemo(() => {
		const locs = new Set(barbers.map((b) => b.location))
		return Array.from(locs).sort()
	}, [barbers])

	const categories = ["Men", "Women", "Kids", "Beard", "Haircut", "Styling"]

	const categoryKeywords: Record<string, string[]> = {
		Men: ["fade", "saqqal", "təraş", "kişi", "klassik"],
		Women: ["rəngləmə", "qadın", "xanım", "uzun saç", "stilləşdirmə"],
		Kids: ["uşaq"],
		Beard: ["saqqal", "təraş"],
		Haircut: ["kəsim", "saç"],
		Styling: ["stilləşdirmə", "baxım"]
	}

	const filteredBarbers = useMemo(() => {
		return barbers.filter((barber) => {
			// Location Filter
			if (selectedLocation && barber.location !== selectedLocation) return false

			// Category Filter (Specialties)
			if (selectedCategory) {
				const keywords = categoryKeywords[selectedCategory] || [
					selectedCategory.toLowerCase()
				]
				const hasSpecialty = barber.specialties.some((s) =>
					keywords.some((k) => s.toLowerCase().includes(k))
				)
				const hasService = barber.services.some((s) =>
					keywords.some((k) => s.name.toLowerCase().includes(k))
				)

				if (!hasSpecialty && !hasService) return false
			}

			// Price Filter (Check if any service matches the range)
			if (priceLevel !== "all") {
				const hasMatchingPrice = barber.services.some((s) => {
					if (priceLevel === "low") return s.price <= 20
					if (priceLevel === "medium") return s.price > 20 && s.price <= 50
					if (priceLevel === "high") return s.price > 50
					return false
				})
				if (!hasMatchingPrice) return false
			}

			// Rating Filter
			if (minRating > 0 && barber.rating < minRating) return false

			return true
		})
	}, [barbers, selectedLocation, selectedCategory, priceLevel, minRating])

	const clearFilters = () => {
		setSelectedLocation("")
		setSelectedCategory("")
		setPriceLevel("all")
		setMinRating(0)
		setSearch("")
	}

	const activeFiltersCount = [
		selectedLocation,
		selectedCategory,
		priceLevel !== "all",
		minRating > 0
	].filter(Boolean).length

	return (
		<div className='animate-fade-in'>
			{/* Hero Section */}
			<div className='relative bg-slate-900 text-white'>
				<div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20"></div>
				<div className='absolute inset-0 bg-gradient-to-b from-slate-900/0 via-slate-900/50 to-slate-50'></div>

				<div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 text-center'>
					<h1 className='text-5xl md:text-7xl font-bold tracking-tight mb-6'>
						{t("home.hero_title")} <br />
						<span className='text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200'>
							{t("home.hero_subtitle")}
						</span>
					</h1>
					<p className='text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-light'>
						{t("home.hero_desc")}
					</p>

					{/* Search Bar */}
					<div className='max-w-2xl mx-auto relative group z-20'>
						<div className='absolute -inset-1 bg-gradient-to-r from-primary-500 to-primary-300 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200'></div>
						<div className='relative flex items-center bg-white rounded-xl p-2 shadow-2xl'>
							<Search className='w-6 h-6 text-slate-400 ml-4' />
							<input
								type='text'
								placeholder={t("home.search_placeholder")}
								className='w-full px-4 py-3 text-lg text-slate-900 placeholder-slate-400 bg-transparent border-none focus:ring-0 outline-none'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
							<button
								onClick={() => setShowFilters(!showFilters)}
								className={clsx(
									"p-3 rounded-lg mr-2 transition-colors flex items-center gap-2",
									showFilters || activeFiltersCount > 0
										? "bg-primary-50 text-primary-600"
										: "hover:bg-slate-100 text-slate-500"
								)}
							>
								<Filter className='w-5 h-5' />
								{activeFiltersCount > 0 && (
									<span className='bg-primary-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full'>
										{activeFiltersCount}
									</span>
								)}
							</button>
							<button className='bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-black transition-colors'>
								{t("home.search_btn")}
							</button>
						</div>

						{/* Filters Panel */}
						{showFilters && (
							<div className='absolute top-full left-0 right-0 mt-4 bg-white rounded-xl shadow-xl border border-slate-100 p-6 animate-slide-up text-left z-50'>
								<div className='flex justify-between items-center mb-4'>
									<h3 className='font-bold text-slate-900'>{t("home.filters.title")}</h3>
									<div className='flex items-center gap-4'>
										{activeFiltersCount > 0 && (
											<button
												onClick={clearFilters}
												className='text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1'
											>
												<X className='w-4 h-4' /> {t("home.filters.clear_all")}
											</button>
										)}
										<button
											onClick={() => setShowFilters(false)}
											className='text-slate-400 hover:text-slate-600'
										>
											<X className='w-5 h-5' />
										</button>
									</div>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
									{/* Location */}
									<div>
										<label className='block text-sm font-medium text-slate-700 mb-2'>
											{t("home.filters.location")}
										</label>
										<select
											value={selectedLocation}
											onChange={(e) => setSelectedLocation(e.target.value)}
											className='w-full p-2.5 rounded-lg border border-slate-200 text-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none'
										>
											<option value=''>{t("home.filters.all_locations")}</option>
											{locations.map((loc) => (
												<option key={loc} value={loc}>
													{loc}
												</option>
											))}
										</select>
									</div>

									{/* Category */}
									<div>
										<label className='block text-sm font-medium text-slate-700 mb-2'>
											{t("home.filters.category")}
										</label>
										<select
											value={selectedCategory}
											onChange={(e) => setSelectedCategory(e.target.value)}
											className='w-full p-2.5 rounded-lg border border-slate-200 text-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none'
										>
											<option value=''>{t("home.filters.all_categories")}</option>
											{categories.map((cat) => (
												<option key={cat} value={cat}>
													{t(`categories.${cat}`)}
												</option>
											))}
										</select>
									</div>

									{/* Price */}
									<div>
										<label className='block text-sm font-medium text-slate-700 mb-2'>
											{t("home.filters.price_level")}
										</label>
										<select
											value={priceLevel}
											onChange={(e) => setPriceLevel(e.target.value as any)}
											className='w-full p-2.5 rounded-lg border border-slate-200 text-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none'
										>
											<option value='all'>{t("home.filters.any_price")}</option>
											<option value='low'>{t("home.filters.price_low")}</option>
											<option value='medium'>{t("home.filters.price_medium")}</option>
											<option value='high'>{t("home.filters.price_high")}</option>
										</select>
									</div>

									{/* Rating */}
									<div>
										<label className='block text-sm font-medium text-slate-700 mb-2'>
											{t("home.filters.rating")}
										</label>
										<select
											value={minRating}
											onChange={(e) => setMinRating(Number(e.target.value))}
											className='w-full p-2.5 rounded-lg border border-slate-200 text-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none'
										>
											<option value='0'>{t("home.filters.any_rating")}</option>
											<option value='4.5'>{t("home.filters.stars_4_5")}</option>
											<option value='4.0'>{t("home.filters.stars_4_0")}</option>
											<option value='3.5'>{t("home.filters.stars_3_5")}</option>
										</select>
									</div>
								</div>

								<div className='mt-6 pt-4 border-t border-slate-100 flex justify-end'>
									<button
										onClick={() => setShowFilters(false)}
										className='bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors'
									>
										{t("home.filters.show_results", { count: filteredBarbers.length })}
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Content Section */}
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20'>
				{loading ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className='bg-white rounded-2xl h-96 animate-pulse shadow-soft'
							></div>
						))}
					</div>
				) : filteredBarbers.length === 0 ? (
					<div className='text-center py-20'>
						<div className='bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4'>
							<Search className='w-10 h-10 text-slate-300' />
						</div>
						<h3 className='text-xl font-bold text-slate-900 mb-2'>
							{t("home.filters.no_results_title")}
						</h3>
						<p className='text-slate-500'>{t("home.filters.no_results_desc")}</p>
						{activeFiltersCount > 0 && (
							<button
								onClick={clearFilters}
								className='mt-4 text-primary-600 font-semibold hover:underline'
							>
								{t("home.filters.clear_filters_btn")}
							</button>
						)}
					</div>
				) : (
					<>
						{/* VIP Section */}
						{filteredBarbers.some((b) => b.tier === "vip") && (
							<div className='mb-16'>
								<div className='flex items-center justify-between mb-8'>
									<div className='flex items-center gap-3'>
										<h2 className='text-2xl font-bold text-slate-900'>
											{t("home.vip_section")}
										</h2>
										<span className='bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-0.5 rounded border border-yellow-200'>
											{t("home.vip_badge")}
										</span>
									</div>
								</div>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
									{filteredBarbers
										.filter((b) => b.tier === "vip")
										.map((barber) => (
											<Link
												key={barber.id}
												to={`/barbers/${barber.id}`}
												className='group'
											>
												<div className='card overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 h-full flex flex-col border-2 border-yellow-400/30 relative bg-white'>
													<div className='absolute top-0 right-0 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-20 shadow-sm'>
														VIP
													</div>
													<div className='aspect-[4/3] relative overflow-hidden'>
														{barber.portfolio[0] ? (
															<img
																src={barber.portfolio[0]}
																alt={barber.name}
																className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
															/>
														) : (
															<div className='w-full h-full bg-slate-100 flex items-center justify-center text-slate-400'>
																<Scissors className='w-12 h-12 opacity-20' />
															</div>
														)}
														<div className='absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-bold text-slate-900 shadow-sm'>
															<Star className='w-3.5 h-3.5 fill-yellow-400 text-yellow-400' />
															{barber.rating}
														</div>
													</div>

													<div className='p-6 flex flex-col flex-grow bg-gradient-to-b from-yellow-50/30 to-white'>
														<div className='mb-4'>
															<h3 className='text-xl font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors'>
																{barber.name}
															</h3>
															<div className='flex items-center text-slate-500 text-sm'>
																<MapPin className='w-4 h-4 mr-1 text-slate-400' />
																{barber.location}
															</div>
														</div>

														<div className='flex flex-wrap gap-2 mt-auto'>
															{barber.specialties.slice(0, 3).map((tag) => (
																<span
																	key={tag}
																	className='px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full border border-yellow-200'
																>
																	{tag}
																</span>
															))}
														</div>
													</div>
												</div>
											</Link>
										))}
								</div>
							</div>
						)}

						{/* Marketing Banner */}
						<div className='bg-gradient-to-r from-primary-50 to-white rounded-2xl p-6 md:p-8 mb-8 border border-primary-100 shadow-sm relative overflow-hidden group'>
							<div className='absolute top-0 right-0 w-64 h-64 bg-primary-100/50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary-200/50'></div>

							<div className='relative z-10 flex flex-col md:flex-row items-center gap-6'>
								<div className='p-3 bg-white rounded-xl shadow-sm border border-primary-100 hidden md:block'>
									<QrCode className='w-8 h-8 text-primary-600' />
								</div>
								<div className='flex-1 text-center md:text-left'>
									<div className='inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold uppercase tracking-wider mb-2 border border-primary-200'>
										<QrCode className='w-3 h-3' />
										{t("home.banner_badge")}
									</div>
									<h3 className='text-xl font-bold mb-1 text-slate-900'>
										{t("home.banner_title")}
									</h3>
									<p className='text-slate-600 text-sm leading-relaxed'>
										{t("home.banner_desc")}
									</p>
								</div>
								<div className='flex-shrink-0'>
									<div className='bg-white p-2 rounded-lg shadow-md transform rotate-3 transition-transform group-hover:rotate-0 duration-300 border border-slate-100'>
										<div className='w-16 h-16 bg-white rounded flex items-center justify-center border-2 border-dashed border-slate-200'>
											<QrCode className='w-8 h-8 text-slate-900' />
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Standard List */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
							{filteredBarbers
								.filter((b) => b.tier !== "vip")
								.map((barber) => (
									<Link key={barber.id} to={`/barbers/${barber.id}`} className='group'>
										<div className='card overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white'>
											<div className='aspect-[4/3] relative overflow-hidden'>
												{barber.portfolio[0] ? (
													<img
														src={barber.portfolio[0]}
														alt={barber.name}
														className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
													/>
												) : (
													<div className='w-full h-full bg-slate-100 flex items-center justify-center text-slate-400'>
														<Scissors className='w-12 h-12 opacity-20' />
													</div>
												)}
												<div className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-bold text-slate-900 shadow-sm'>
													<Star className='w-3.5 h-3.5 fill-yellow-400 text-yellow-400' />
													{barber.rating}
												</div>
											</div>

											<div className='p-6 flex flex-col flex-grow'>
												<div className='mb-4'>
													<h3 className='text-xl font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors'>
														{barber.name}
													</h3>
													<div className='flex items-center text-slate-500 text-sm'>
														<MapPin className='w-4 h-4 mr-1 text-slate-400' />
														{barber.location}
													</div>
												</div>

												<div className='flex flex-wrap gap-2 mt-auto'>
													{barber.specialties.slice(0, 3).map((tag) => (
														<span
															key={tag}
															className='px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full'
														>
															{tag}
														</span>
													))}
													{barber.specialties.length > 3 && (
														<span className='px-3 py-1 bg-slate-50 text-slate-400 text-xs font-medium rounded-full'>
															+{barber.specialties.length - 3} {t("home.more")}
														</span>
													)}
												</div>
											</div>
										</div>
									</Link>
								))}
						</div>
					</>
				)}
			</div>
		</div>
	)
}
