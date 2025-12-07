import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { useFavoritesStore } from "../store/favoritesStore"
import { Star, MapPin, Scissors, Heart, ArrowLeft } from "lucide-react"

export const FavoritesPage = () => {
	const { user } = useAuthStore()
	const { favorites, isLoading, fetchFavorites, removeFavorite } = useFavoritesStore()
	const navigate = useNavigate()

	useEffect(() => {
		if (user) {
			fetchFavorites(user.id)
		} else {
			navigate("/login")
		}
	}, [user, navigate, fetchFavorites])

	if (!user) return null

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in'>
			<div className='flex items-center gap-4 mb-8'>
				<button
					onClick={() => navigate(-1)}
					className='p-2 hover:bg-slate-100 rounded-full transition-colors'
				>
					<ArrowLeft className='w-6 h-6 text-slate-600' />
				</button>
				<div>
					<h1 className='text-3xl font-bold text-slate-900'>Seçilmişlər</h1>
					<p className='text-slate-500 mt-1'>Bəyəndiyiniz bərbərlərin siyahısı</p>
				</div>
			</div>

			{isLoading ? (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className='bg-white rounded-2xl h-96 animate-pulse shadow-soft'
						></div>
					))}
				</div>
			) : favorites.length === 0 ? (
				<div className='text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200'>
					<Heart className='w-16 h-16 text-slate-300 mx-auto mb-4' />
					<h2 className='text-xl font-semibold text-slate-900 mb-2'>Siyahı boşdur</h2>
					<p className='text-slate-500 mb-6'>
						Hələ heç bir bərbəri seçilmişlərə əlavə etməmisiniz.
					</p>
					<Link to='/' className='btn-primary inline-flex items-center gap-2'>
						<Scissors className='w-4 h-4' />
						Bərbərləri kəşf et
					</Link>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
					{favorites.map((barber) => (
						<div key={barber.id} className='group relative'>
							<Link to={`/barbers/${barber.id}`} className='block h-full'>
								<div className='card overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white'>
									<div className='aspect-[4/3] relative overflow-hidden'>
										{barber.portfolio && barber.portfolio[0] ? (
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
										</div>
									</div>
								</div>
							</Link>
							<button
								onClick={(e) => {
									e.preventDefault()
									removeFavorite(user.id, barber.id)
								}}
								className='absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm z-10'
								title='Seçilmişlərdən sil'
							>
								<Heart className='w-5 h-5 fill-current' />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
