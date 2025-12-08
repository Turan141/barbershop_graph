import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { api } from "../services/api"
import { Barber, Review, Service } from "../types"
import { useAuthStore } from "../store/authStore"
import { useFavoritesStore } from "../store/favoritesStore"
import { BookingWidget } from "../components/BookingWidget"
import { Modal } from "../components/Modal"
import {
	Star,
	Heart,
	ChevronLeft,
	ChevronRight,
	MapPin,
	Calendar,
	ShieldCheck,
	Scissors,
	Image as ImageIcon,
	MessageSquare,
	X
} from "lucide-react"
import clsx from "clsx"

const REVIEWS_PER_PAGE = 5

export const BarberProfilePage = () => {
	const { t } = useTranslation()
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { user } = useAuthStore()
	const { isFavorite, addFavorite, removeFavorite, fetchFavorites } = useFavoritesStore()

	const [barber, setBarbers] = useState<Barber | null>(null)
	const [selectedService, setSelectedService] = useState<Service | null>(null)
	const [showAllPortfolio, setShowAllPortfolio] = useState(false)
	const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

	// Reviews state
	const [reviews, setReviews] = useState<Review[]>([])
	const [showReviewModal, setShowReviewModal] = useState(false)
	const [rating, setRating] = useState(0)
	const [reviewText, setReviewText] = useState("")
	const [submittingReview, setSubmittingReview] = useState(false)
	const [reviewsPage, setReviewsPage] = useState(1)

	useEffect(() => {
		if (id) {
			api.barbers.get(id).then(setBarbers)
			api.barbers.getReviews(id).then(setReviews)
			if (user) fetchFavorites(user.id)
		}
	}, [id, user])

	if (!barber)
		return (
			<div className='min-h-[60vh] flex items-center justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600'></div>
			</div>
		)

	const isFav = id ? isFavorite(id) : false

	const toggleFavorite = () => {
		if (!user) return navigate("/login")
		if (id) {
			isFav ? removeFavorite(user.id, id) : addFavorite(user.id, id)
		}
	}

	const handleSubmitReview = async () => {
		if (!user || !id || rating === 0) return
		setSubmittingReview(true)
		try {
			const newReview = await api.barbers.addReview(id, {
				userId: user.id,
				rating,
				text: reviewText
			})
			setReviews([newReview, ...reviews])
			setShowReviewModal(false)
			setRating(0)
			setReviewText("")
			// Refresh barber to get updated rating
			api.barbers.get(id).then(setBarbers)
		} catch (error) {
			console.error("Failed to submit review", error)
		} finally {
			setSubmittingReview(false)
		}
	}

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in'>
			{/* Breadcrumb */}
			<button
				onClick={() => navigate(-1)}
				className='flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors'
			>
				<ChevronLeft className='w-4 h-4 mr-1' />
				{t("profile.back_to_search")}
			</button>

			<div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
				{/* Left Column: Info (8 cols) */}
				<div className='lg:col-span-8 space-y-8'>
					{/* Profile Header Card */}
					<div className='card p-8 relative overflow-hidden bg-white group'>
						<div className='absolute top-0 left-0 w-full h-32 bg-slate-100 overflow-hidden'>
							<div className='absolute inset-0 bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] bg-[size:24px_24px]'></div>
							<div className='absolute -top-24 -right-24 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl'></div>
							<div className='absolute -bottom-24 -left-24 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl'></div>
						</div>
						<div className='relative flex flex-col sm:flex-row gap-6 items-start pt-12'>
							<div className='relative'>
								<img
									src={barber.avatarUrl}
									alt={barber.name}
									className='w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg'
								/>
								<div className='absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white'>
									{t("profile.open")}
								</div>
							</div>

							<div className='flex-grow pt-2'>
								<div className='flex justify-between items-start'>
									<div>
										<h1 className='text-3xl font-bold text-slate-900'>{barber.name}</h1>
										<div className='flex items-center text-slate-500 mt-2'>
											<MapPin className='w-4 h-4 mr-1' />
											{barber.location}
										</div>
									</div>
									<button
										onClick={toggleFavorite}
										className={clsx(
											"p-3 rounded-xl transition-all border",
											isFav
												? "bg-red-50 border-red-100 text-red-500"
												: "bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100"
										)}
									>
										<Heart className={clsx("w-6 h-6", isFav && "fill-current")} />
									</button>
								</div>

								<div className='flex items-center gap-6 mt-6'>
									<div className='flex items-center gap-2'>
										<div className='bg-yellow-100 p-1.5 rounded-lg'>
											<Star className='w-5 h-5 text-yellow-600 fill-yellow-600' />
										</div>
										<div>
											<div className='font-bold text-slate-900'>{barber.rating}</div>
											<div className='text-xs text-slate-500'>
												{barber.reviewCount} {t("profile.reviews")}
											</div>
										</div>
									</div>
									<div className='w-px h-8 bg-slate-200'></div>
									<div className='flex items-center gap-2'>
										<div className='bg-blue-100 p-1.5 rounded-lg'>
											<ShieldCheck className='w-5 h-5 text-blue-600' />
										</div>
										<div>
											<div className='font-bold text-slate-900'>
												{t("profile.verified")}
											</div>
											<div className='text-xs text-slate-500'>
												{t("profile.professional")}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className='mt-8 pt-8 border-t border-slate-100'>
							<h3 className='font-semibold text-slate-900 mb-3'>{t("profile.about")}</h3>
							<p className='text-slate-600 leading-relaxed'>{barber.bio}</p>
						</div>
					</div>

					{/* Location Map */}
					<div>
						<h2 className='text-xl font-bold text-slate-900 mb-4 flex items-center gap-2'>
							<MapPin className='w-5 h-5 text-primary-600' />
							{t("profile.location")}
						</h2>
						<div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-64 relative group'>
							<iframe
								width='100%'
								height='100%'
								frameBorder='0'
								scrolling='no'
								marginHeight={0}
								marginWidth={0}
								src={`https://maps.google.com/maps?q=${encodeURIComponent(
									barber.location
								)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
								className='filter grayscale group-hover:grayscale-0 transition-all duration-500'
							></iframe>
							<div className='absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-slate-100 flex items-center gap-2 text-sm font-medium text-slate-900'>
								<MapPin className='w-4 h-4 text-primary-600' />
								{barber.location}
							</div>
						</div>
					</div>

					{/* Services Menu (Table/Grid) */}
					<div className='mt-8'>
						<h2 className='text-xl font-bold text-slate-900 mb-6 flex items-center gap-2'>
							<Scissors className='w-5 h-5 text-primary-600' />
							{t("profile.services_menu")}
						</h2>
						<div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
							{/* Table Header (Desktop) */}
							<div className='hidden sm:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider'>
								<div className='col-span-6'>{t("profile.service_name")}</div>
								<div className='col-span-3 text-center'>{t("profile.duration")}</div>
								<div className='col-span-3 text-right'>{t("profile.price")}</div>
							</div>

							{/* Service Rows */}
							<div className='divide-y divide-slate-100'>
								{barber.services.length > 0 ? (
									barber.services.map((service) => (
										<div
											key={service.id}
											className='p-3 sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center bg-white hover:bg-slate-50 transition-colors'
										>
											{/* Name & Icon */}
											<div className='col-span-6 flex items-center gap-3 mb-1 sm:mb-0'>
												<div className='w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0'>
													<Scissors className='w-4 h-4' />
												</div>
												<div>
													<div className='font-medium text-slate-900 text-sm sm:text-base'>
														{service.name}
													</div>
													{/* Mobile Duration/Price */}
													<div className='sm:hidden text-xs text-slate-500'>
														{service.duration} {t("profile.min")} •{" "}
														{service.currency === "AZN" ? "₼" : service.currency}
														{service.price}
													</div>
												</div>
											</div>

											{/* Duration (Desktop) */}
											<div className='hidden sm:block col-span-3 text-center text-sm text-slate-500'>
												{service.duration} {t("profile.min")}
											</div>

											{/* Price (Desktop) */}
											<div className='hidden sm:block col-span-3 text-right'>
												<span className='font-bold text-slate-900'>
													{service.currency === "AZN" ? "₼" : service.currency}
													{service.price}
												</span>
											</div>
										</div>
									))
								) : (
									<div className='text-center py-12'>
										<p className='text-slate-500 font-medium'>
											{t("profile.no_services")}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Portfolio Section */}
					{barber.portfolio && barber.portfolio.length > 0 && (
						<div className='mt-8'>
							<div className='flex justify-between items-center mb-4'>
								<h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
									<ImageIcon className='w-5 h-5 text-primary-600' />
									{t("profile.portfolio")}
								</h2>
								{barber.portfolio.length > 4 && (
									<button
										onClick={() => setShowAllPortfolio(!showAllPortfolio)}
										className='text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors'
									>
										{showAllPortfolio ? t("profile.show_less") : t("profile.view_all")}
									</button>
								)}
							</div>
							<div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
								{(showAllPortfolio ? barber.portfolio : barber.portfolio.slice(0, 4)).map(
									(url, index) => (
										<div
											key={index}
											className='aspect-square rounded-xl overflow-hidden bg-slate-100 group cursor-pointer'
											onClick={() => window.open(url, "_blank")}
										>
											<img
												src={url}
												alt={`Portfolio ${index + 1}`}
												className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
											/>
										</div>
									)
								)}
							</div>
						</div>
					)}
					{/* Reviews Section */}
					<div className='mt-8'>
						<div className='flex justify-between items-center mb-6'>
							<h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
								<MessageSquare className='w-5 h-5 text-primary-600' />
								{t("profile.reviews_section_title")} ({reviews.length})
							</h2>
							{user && !reviews.find((r) => r.userId === user.id) && (
								<button
									onClick={() => setShowReviewModal(true)}
									className='btn-secondary text-sm py-2 px-4'
								>
									{t("profile.write_review")}
								</button>
							)}
						</div>

						<div className='space-y-4'>
							{reviews.length > 0 ? (
								<>
									{reviews
										.slice(
											(reviewsPage - 1) * REVIEWS_PER_PAGE,
											reviewsPage * REVIEWS_PER_PAGE
										)
										.map((review) => (
											<div
												key={review.id}
												className='bg-white p-6 rounded-2xl border border-slate-100'
											>
												<div className='flex justify-between items-start mb-2'>
													<div className='flex items-center gap-3'>
														<div className='w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold'>
															{review.user?.name?.[0] || "U"}
														</div>
														<div>
															<div className='font-bold text-slate-900'>
																{review.user?.name || "User"}
															</div>
															<div className='text-xs text-slate-500'>
																{new Date(review.createdAt).toLocaleDateString()}
															</div>
														</div>
													</div>
													<div className='flex gap-1'>
														{Array.from({ length: 5 }).map((_, i) => (
															<Star
																key={i}
																className={clsx(
																	"w-4 h-4",
																	i < review.rating
																		? "text-yellow-400 fill-yellow-400"
																		: "text-slate-200"
																)}
															/>
														))}
													</div>
												</div>
												{review.text && (
													<p className='text-slate-600 mt-2'>{review.text}</p>
												)}
											</div>
										))}

									{reviews.length > REVIEWS_PER_PAGE && (
										<div className='flex justify-center items-center gap-2 mt-6'>
											<button
												onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
												disabled={reviewsPage === 1}
												className='p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
											>
												<ChevronLeft className='w-4 h-4 text-slate-600' />
											</button>
											<span className='text-sm font-medium text-slate-600'>
												{reviewsPage} / {Math.ceil(reviews.length / REVIEWS_PER_PAGE)}
											</span>
											<button
												onClick={() =>
													setReviewsPage((p) =>
														Math.min(Math.ceil(reviews.length / REVIEWS_PER_PAGE), p + 1)
													)
												}
												disabled={
													reviewsPage === Math.ceil(reviews.length / REVIEWS_PER_PAGE)
												}
												className='p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
											>
												<ChevronRight className='w-4 h-4 text-slate-600' />
											</button>
										</div>
									)}
								</>
							) : (
								<div className='text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200'>
									<p className='text-slate-500'>{t("profile.no_reviews")}</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Right Column: Booking Widget (4 cols) */}
				<div className='hidden lg:block lg:col-span-4'>
					<div className='sticky top-24'>
						<div className='card p-6 shadow-xl shadow-slate-200/50 border-slate-100 bg-white/80 backdrop-blur-xl ring-1 ring-slate-200/50'>
							<h2 className='text-lg font-bold text-slate-900 mb-6 flex items-center gap-2'>
								<div className='p-2 bg-primary-50 rounded-lg'>
									<Calendar className='w-5 h-5 text-primary-600' />
								</div>
								{t("profile.book_appointment")}
							</h2>

							<BookingWidget
								barber={barber}
								selectedService={selectedService}
								onServiceSelect={setSelectedService}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Booking Bar */}
			<div className='fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 lg:hidden z-40 safe-area-bottom'>
				<button
					onClick={() => setIsBookingModalOpen(true)}
					className='btn-primary w-full py-3.5 text-lg shadow-lg shadow-primary-500/20'
				>
					{t("profile.book_now")}
				</button>
			</div>

			{/* Booking Modal for Mobile */}
			<Modal
				isOpen={isBookingModalOpen}
				onClose={() => setIsBookingModalOpen(false)}
				title={t("profile.book_appointment")}
			>
				<BookingWidget
					barber={barber}
					selectedService={selectedService}
					onServiceSelect={setSelectedService}
					onSuccess={() => {
						// Optional: close modal after success, but BookingWidget shows success state.
						// Maybe close after a delay or let user close it.
					}}
				/>
			</Modal>
			{/* Review Modal */}
			{showReviewModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in'>
					<div className='bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up'>
						<div className='p-6 border-b border-slate-100 flex justify-between items-center'>
							<h3 className='text-lg font-bold text-slate-900'>
								{t("profile.rate_experience")}
							</h3>
							<button
								onClick={() => setShowReviewModal(false)}
								className='text-slate-400 hover:text-slate-600 transition-colors'
							>
								<X className='w-5 h-5' />
							</button>
						</div>
						<div className='p-6 space-y-6'>
							<div className='flex justify-center gap-2'>
								{[1, 2, 3, 4, 5].map((star) => (
									<button
										key={star}
										onClick={() => setRating(star)}
										className='transition-transform hover:scale-110 focus:outline-none'
									>
										<Star
											className={clsx(
												"w-10 h-10 transition-colors",
												star <= rating
													? "text-yellow-400 fill-yellow-400"
													: "text-slate-200 hover:text-yellow-200"
											)}
										/>
									</button>
								))}
							</div>
							<textarea
								value={reviewText}
								onChange={(e) => setReviewText(e.target.value)}
								placeholder={t("profile.review_placeholder")}
								className='w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none transition-all'
							></textarea>
							<button
								onClick={handleSubmitReview}
								disabled={rating === 0 || submittingReview}
								className='btn-primary w-full py-3'
							>
								{submittingReview ? t("profile.submitting") : t("profile.submit_review")}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
