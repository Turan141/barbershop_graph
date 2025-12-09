import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { api } from "../services/api"
import { Barber } from "../types"
import {
	Star,
	MapPin,
	Search,
	Scissors,
	QrCode,
	Filter,
	X,
	ChevronLeft,
	ChevronRight,
	Crown
} from "lucide-react"
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
	const [currentPage, setCurrentPage] = useState(1)
	const ITEMS_PER_PAGE = 9

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
	useEffect(() => {
		setCurrentPage(1)
	}, [selectedLocation, selectedCategory, priceLevel, minRating, search])

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
		<div className='animate-fade-in bg-slate-50 min-h-screen pb-20'>
			{/* Modern Header / Hero */}
			<div className='bg-white pt-6 pb-6 px-4 sm:px-6 lg:px-8 shadow-sm border-b border-slate-100'>
				<div className='max-w-7xl mx-auto'>
					<div className='flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8'>
						<div className='max-w-2xl'>
							<h1 className='text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tighter leading-[1.1]'>
								{t("home.hero_title")}
								<span className='block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 pb-1'>
									{t("home.hero_subtitle")}
								</span>
							</h1>
						</div>
					</div>

					{/* Quick Categories (Pills) */}
					{!showFilters && (
						<div className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 mb-6'>
							<button
								onClick={() => {
									setSelectedCategory("")
									setSearch("")
								}}
								className={clsx(
									"px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
									!selectedCategory && !search
										? "bg-slate-900 text-white shadow-md"
										: "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
								)}
							>
								{t("categories.All")}
							</button>
							{categories.map((cat) => (
								<button
									key={cat}
									onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
									className={clsx(
										"px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
										selectedCategory === cat
											? "bg-slate-900 text-white shadow-md"
											: "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
									)}
								>
									{t(`categories.${cat}`)}
								</button>
							))}
						</div>
					)}

					{/* Compact Search Bar */}
					<div className='relative w-full max-w-md group mb-6'>
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<Search className='h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors' />
						</div>
						<input
							type='text'
							className='block w-full pl-10 pr-12 py-3 border-0 bg-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all duration-200 font-medium'
							placeholder={t("home.search_placeholder")}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
						<button
							onClick={() => setShowFilters(!showFilters)}
							className={clsx(
								"absolute inset-y-1 right-1 px-3 rounded-xl flex items-center justify-center transition-colors",
								showFilters || activeFiltersCount > 0
									? "bg-white text-primary-600 shadow-sm"
									: "text-slate-400 hover:text-slate-600 hover:bg-white/50"
							)}
						>
							<Filter className='h-4 w-4' />
							{activeFiltersCount > 0 && (
								<span className='absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full'></span>
							)}
						</button>
					</div>

					{/* Filters Panel (Collapsible) */}
					<div
						className={clsx(
							"overflow-hidden transition-all duration-300 ease-in-out",
							showFilters ? "max-h-96 opacity-100 mb-6" : "max-h-0 opacity-0"
						)}
					>
						<div className='bg-white rounded-2xl border border-slate-100 p-4 shadow-lg shadow-slate-200/50'>
							<div className='flex justify-between items-center mb-4'>
								<h3 className='font-bold text-slate-900 text-sm uppercase tracking-wider'>
									{t("home.filters.title")}
								</h3>
								{activeFiltersCount > 0 && (
									<button
										onClick={clearFilters}
										className='text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors'
									>
										<X className='w-3 h-3' /> {t("home.filters.clear_all")}
									</button>
								)}
							</div>

							<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
								<select
									value={selectedLocation}
									onChange={(e) => setSelectedLocation(e.target.value)}
									className='w-full p-2.5 rounded-xl bg-slate-50 border-0 text-slate-700 text-sm font-medium focus:ring-2 focus:ring-primary-500/20'
								>
									<option value=''>{t("home.filters.all_locations")}</option>
									{locations.map((loc) => (
										<option key={loc} value={loc}>
											{loc}
										</option>
									))}
								</select>

								<select
									value={selectedCategory}
									onChange={(e) => setSelectedCategory(e.target.value)}
									className='w-full p-2.5 rounded-xl bg-slate-50 border-0 text-slate-700 text-sm font-medium focus:ring-2 focus:ring-primary-500/20'
								>
									<option value=''>{t("home.filters.all_categories")}</option>
									{categories.map((cat) => (
										<option key={cat} value={cat}>
											{t(`categories.${cat}`)}
										</option>
									))}
								</select>

								<select
									value={priceLevel}
									onChange={(e) => setPriceLevel(e.target.value as any)}
									className='w-full p-2.5 rounded-xl bg-slate-50 border-0 text-slate-700 text-sm font-medium focus:ring-2 focus:ring-primary-500/20'
								>
									<option value='all'>{t("home.filters.any_price")}</option>
									<option value='low'>{t("home.filters.price_low")}</option>
									<option value='medium'>{t("home.filters.price_medium")}</option>
									<option value='high'>{t("home.filters.price_high")}</option>
								</select>

								<select
									value={minRating}
									onChange={(e) => setMinRating(Number(e.target.value))}
									className='w-full p-2.5 rounded-xl bg-slate-50 border-0 text-slate-700 text-sm font-medium focus:ring-2 focus:ring-primary-500/20'
								>
									<option value='0'>{t("home.filters.any_rating")}</option>
									<option value='4.5'>{t("home.filters.stars_4_5")}</option>
									<option value='4.0'>{t("home.filters.stars_4_0")}</option>
								</select>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6'>
				{loading ? (
					<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
						{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
							<div
								key={i}
								className='bg-white rounded-3xl h-80 animate-pulse shadow-sm'
							></div>
						))}
					</div>
				) : filteredBarbers.length === 0 ? (
					<div className='text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm'>
						<div className='bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4'>
							<Search className='w-10 h-10 text-slate-300' />
						</div>
						<h3 className='text-xl font-bold text-slate-900 mb-2'>
							{t("home.filters.no_results_title")}
						</h3>
						<p className='text-slate-500'>{t("home.filters.no_results_desc")}</p>
						<button
							onClick={clearFilters}
							className='mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors'
						>
							{t("home.filters.clear_filters_btn")}
						</button>
					</div>
				) : (
					<>
						{/* VIP Section - Horizontal Scroll on Mobile, Grid on Desktop */}
						{filteredBarbers.some((b) => b.tier === "vip") && (
							<div className='mb-12'>
								<div className='flex items-center justify-between mb-6'>
									<h2 className='text-2xl font-bold text-slate-900 flex items-center gap-2'>
										{t("home.vip_section")}
										<Star className='w-5 h-5 fill-yellow-400 text-yellow-400' />
									</h2>
								</div>

								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
									{filteredBarbers
										.filter((b) => b.tier === "vip")
										.map((barber) => (
											<Link
												key={barber.id}
												to={`/barbers/${barber.id}`}
												className='group relative block h-80 sm:h-96 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 ring-1 ring-slate-200 hover:ring-2 hover:ring-yellow-400/50'
											>
												<div className='absolute inset-0 bg-slate-200'>
													{barber.previewImageUrl || barber.portfolio[0] ? (
														<img
															src={barber.previewImageUrl || barber.portfolio[0]}
															alt={barber.name}
															className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
														/>
													) : (
														<div className='w-full h-full flex items-center justify-center text-slate-400'>
															<Scissors className='w-12 h-12 opacity-20' />
														</div>
													)}
												</div>

												{/* Rich Gradient Overlay */}
												<div className='absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500'></div>

												{/* Gold Shine Effect */}
												<div className='absolute inset-0 bg-gradient-to-tr from-yellow-500/0 via-yellow-500/0 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

												{/* Top Right Rating */}
												<div className='absolute top-4 right-4 z-10'>
													<div className='flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-sm'>
														<Star className='w-3.5 h-3.5 fill-yellow-400 text-yellow-400' />
														<span className='font-bold text-sm text-white'>
															{barber.rating}
														</span>
													</div>
												</div>

												{/* Content */}
												<div className='absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500'>
													<div className='flex items-center justify-between mb-3'>
														<div className='bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-xs font-extrabold tracking-wider shadow-lg shadow-yellow-500/20 flex items-center gap-1'>
															<Crown className='w-3 h-3' />
															VIP
														</div>
													</div>

													<h3 className='text-2xl font-bold mb-1.5 text-white group-hover:text-yellow-50 transition-colors'>
														{barber.name}
													</h3>

													<div className='flex items-center text-slate-300 text-sm mb-4 font-medium'>
														<MapPin className='w-4 h-4 mr-1.5 text-yellow-500' />
														{barber.location}
													</div>

													<div className='flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100'>
														{barber.specialties.slice(0, 3).map((tag) => (
															<span
																key={tag}
																className='text-[10px] font-bold px-2.5 py-1 bg-white/10 rounded-lg backdrop-blur-md border border-white/10 text-slate-200'
															>
																{tag}
															</span>
														))}
													</div>
												</div>
											</Link>
										))}
								</div>
							</div>
						)}

						{/* Marketing Banner - Clean Style */}
						<div className='bg-slate-900 rounded-[2rem] p-8 mb-12 relative overflow-hidden text-white shadow-xl shadow-slate-200'>
							<div className='absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-[100px] opacity-20 -mr-16 -mt-16'></div>
							<div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-8'>
								<div className='text-center md:text-left max-w-xl'>
									<div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10'>
										<QrCode className='w-3 h-3' />
										{t("home.banner_badge")}
									</div>
									<h3 className='text-2xl md:text-3xl font-bold mb-3'>
										{t("home.banner_title")}
									</h3>
									<p className='text-slate-400 leading-relaxed'>
										{t("home.banner_desc")}
									</p>
								</div>
								<div className='bg-white p-4 rounded-2xl shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300'>
									<QrCode className='w-24 h-24 text-slate-900' />
								</div>
							</div>
						</div>

						{/* Standard List - Clean Cards */}
						<div>
							<h2 className='text-2xl font-bold text-slate-900 mb-6'>
								{t("home.all_barbers")}
							</h2>
							<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
								{filteredBarbers
									.filter((b) => b.tier !== "vip")
									.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
									.map((barber) => (
										<Link key={barber.id} to={`/barbers/${barber.id}`} className='group'>
											<div className='bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col'>
												<div className='aspect-square relative overflow-hidden bg-slate-100'>
													{barber.previewImageUrl || barber.portfolio[0] ? (
														<img
															src={barber.previewImageUrl || barber.portfolio[0]}
															alt={barber.name}
															className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
														/>
													) : (
														<div className='w-full h-full flex items-center justify-center text-slate-300'>
															<Scissors className='w-10 h-10 opacity-50' />
														</div>
													)}
													<div className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-slate-900 shadow-sm'>
														<Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
														{barber.rating}
													</div>
												</div>

												<div className='p-5 flex flex-col flex-grow'>
													<div className='mb-3'>
														<h3 className='text-lg font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors'>
															{barber.name}
														</h3>
														<div className='flex items-center text-slate-500 text-sm'>
															<MapPin className='w-3.5 h-3.5 mr-1 text-slate-400' />
															{barber.location}
														</div>
													</div>

													<div className='flex flex-wrap gap-1.5 mt-auto'>
														{barber.specialties.slice(0, 2).map((tag) => (
															<span
																key={tag}
																className='px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wide rounded-md border border-slate-100'
															>
																{tag}
															</span>
														))}
														{barber.specialties.length > 2 && (
															<span className='px-2.5 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-md border border-slate-100'>
																+{barber.specialties.length - 2}
															</span>
														)}
													</div>
												</div>
											</div>
										</Link>
									))}
							</div>

							{/* Pagination Controls */}
							{filteredBarbers.filter((b) => b.tier !== "vip").length >
								ITEMS_PER_PAGE && (
								<div className='flex justify-center items-center gap-2 mt-12'>
									<button
										onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
										disabled={currentPage === 1}
										className='w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-slate-50'
									>
										<ChevronLeft className='w-5 h-5 text-slate-600' />
									</button>

									{Array.from({
										length: Math.ceil(
											filteredBarbers.filter((b) => b.tier !== "vip").length /
												ITEMS_PER_PAGE
										)
									}).map((_, i) => (
										<button
											key={i}
											onClick={() => setCurrentPage(i + 1)}
											className={clsx(
												"w-10 h-10 rounded-xl font-bold text-sm transition-all",
												currentPage === i + 1
													? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
													: "text-slate-500 hover:bg-white hover:text-slate-900"
											)}
										>
											{i + 1}
										</button>
									))}

									<button
										onClick={() =>
											setCurrentPage((p) =>
												Math.min(
													Math.ceil(
														filteredBarbers.filter((b) => b.tier !== "vip").length /
															ITEMS_PER_PAGE
													),
													p + 1
												)
											)
										}
										disabled={
											currentPage ===
											Math.ceil(
												filteredBarbers.filter((b) => b.tier !== "vip").length /
													ITEMS_PER_PAGE
											)
										}
										className='w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-slate-50'
									>
										<ChevronRight className='w-5 h-5 text-slate-600' />
									</button>
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	)
}
