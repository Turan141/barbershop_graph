import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../services/api"
import { Barber } from "../types"
import { Star, MapPin, Search, ArrowRight, Scissors } from "lucide-react"
import { useTranslation } from "react-i18next"

export const HomePage = () => {
	const [barbers, setBarbers] = useState<Barber[]>([])
	const [search, setSearch] = useState("")
	const [loading, setLoading] = useState(true)
	const { t } = useTranslation()

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

	return (
		<div className='animate-fade-in'>
			{/* Hero Section */}
			<div className='relative bg-slate-900 text-white overflow-hidden'>
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
					<div className='max-w-2xl mx-auto relative group'>
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
							<button className='bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-black transition-colors'>
								{t("home.search_btn")}
							</button>
						</div>
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
				) : (
					<>
						{/* VIP Section */}
						{barbers.some((b) => b.tier === "vip") && (
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
									{barbers
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

						{/* Standard Section */}
						<div>
							<div className='flex items-center justify-between mb-8'>
								<h2 className='text-2xl font-bold text-slate-900'>
									{t("home.all_barbers")}
								</h2>
								<div className='text-sm text-primary-600 font-semibold cursor-pointer hover:underline flex items-center gap-1'>
									{t("home.view_all")} <ArrowRight className='w-4 h-4' />
								</div>
							</div>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
								{barbers
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
						</div>
					</>
				)}
			</div>
		</div>
	)
}
