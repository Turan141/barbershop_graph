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
	MessageCircle,
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
					<div className='relative bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 isolate'>
						{/* Decorative Background Elements */}
						<div className='absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 rounded-full bg-primary-50 blur-3xl opacity-60 pointer-events-none'></div>
						<div className='absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 rounded-full bg-blue-50 blur-3xl opacity-60 pointer-events-none'></div>

						<div className='relative p-8 sm:p-10'>
							<div className='flex flex-col sm:flex-row gap-8 items-center sm:items-start'>
								{/* Avatar Section */}
								<div className='relative flex-shrink-0 mx-auto sm:mx-0'>
									<div className='w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 bg-gradient-to-tr from-primary-500 via-blue-500 to-cyan-400 shadow-lg'>
										<img
											src={barber.avatarUrl}
											alt={barber.name}
											className='w-full h-full rounded-full object-cover border-4 border-white bg-white'
										/>
									</div>
									<div className='absolute bottom-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full border-[3px] border-white shadow-sm flex items-center gap-1.5'>
										<div className='w-1.5 h-1.5 rounded-full bg-white animate-pulse'></div>
										{t("profile.open")}
									</div>
								</div>

								{/* Info Section */}
								<div className='flex-grow text-center sm:text-left space-y-6 w-full'>
									<div className='flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4'>
										<div className='w-full sm:w-auto'>
											<h1 className='text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2'>
												{barber.name}
											</h1>
											<a
												href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
													barber.location
												)}`}
												target='_blank'
												rel='noopener noreferrer'
												className='flex items-center justify-center sm:justify-start text-slate-500 font-medium bg-slate-50 inline-flex px-3 py-1 rounded-full border border-slate-100 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-all group/location'
											>
												<MapPin className='w-3.5 h-3.5 mr-1.5 text-primary-500 group-hover/location:scale-110 transition-transform' />
												<span className='truncate max-w-[200px] sm:max-w-xs'>
													{barber.location}
												</span>
												{barber.isAddressVerified && (
													<span
														className='ml-2 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 flex-shrink-0'
														title={t("dashboard.profile.official_address")}
													>
														<ShieldCheck className='w-3 h-3' />
														<span className='hidden sm:inline'>
															{t("dashboard.profile.official_address")}
														</span>
													</span>
												)}
											</a>
										</div>

										{/* Actions */}
										<div className='flex items-center gap-2 justify-center sm:justify-end w-full sm:w-auto'>
											{barber.phone && (
												<a
													href={`https://wa.me/${barber.phone.replace(
														/\D/g,
														""
													)}?text=${encodeURIComponent(
														t("profile.whatsapp_message") ||
															"Hello, I would like to book an appointment."
													)}`}
													target='_blank'
													rel='noopener noreferrer'
													className='group flex items-center justify-center w-12 h-12 rounded-full bg-green-50 border border-green-100 text-green-600 hover:bg-green-100 hover:scale-105 transition-all shadow-sm'
													title='WhatsApp'
												>
													<MessageCircle className='w-6 h-6' />
												</a>
											)}
											<button
												onClick={toggleFavorite}
												className={clsx(
													"group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 border",
													isFav
														? "bg-red-50 border-red-100 text-red-500 shadow-inner"
														: "bg-white border-slate-200 text-slate-400 hover:border-primary-200 hover:text-primary-600 hover:shadow-md"
												)}
											>
												<Heart
													className={clsx(
														"w-6 h-6 transition-transform group-active:scale-90",
														isFav && "fill-current"
													)}
												/>
											</button>
										</div>
									</div>

									{/* Stats Grid */}
									<div
										className={clsx(
											"grid gap-4 py-6 border-y border-slate-100/80",
											barber.verificationStatus === "verified"
												? "grid-cols-3"
												: "grid-cols-2"
										)}
									>
										<div className='text-center sm:text-left'>
											<div className='flex items-center justify-center sm:justify-start gap-1.5 text-slate-900 font-bold text-2xl'>
												<Star className='w-5 h-5 text-yellow-400 fill-yellow-400' />
												{barber.rating}
											</div>
											<div className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1'>
												{t("profile.rating")}
											</div>
										</div>
										<div className='text-center sm:text-left border-l border-slate-100 pl-4 sm:pl-8'>
											<div className='text-slate-900 font-bold text-2xl'>
												{barber.reviewCount}
											</div>
											<div className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1'>
												{t("profile.reviews")}
											</div>
										</div>
										{barber.verificationStatus === "verified" && (
											<div className='text-center sm:text-left border-l border-slate-100 pl-4 sm:pl-8'>
												<div className='flex items-center justify-center sm:justify-start gap-1.5 text-blue-600 font-bold text-xl'>
													<ShieldCheck className='w-6 h-6' />
												</div>
												<div className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1'>
													{t("profile.verified")}
												</div>
											</div>
										)}
									</div>

									{/* Bio */}
									<div className='pt-1'>
										<h3 className='text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide opacity-80'>
											{t("profile.about")}
										</h3>
										<p className='text-slate-600 leading-relaxed text-sm sm:text-base font-light'>
											{barber.bio}
										</p>
									</div>
								</div>
							</div>
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
