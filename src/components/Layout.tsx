import * as React from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { Scissors, LogOut, Calendar, Heart, Menu, X, Clock } from "lucide-react"
import clsx from "clsx"
import { useTranslation } from "react-i18next"
import { LanguageSwitcher } from "./LanguageSwitcher"

export const Layout = ({ children }: { children: React.ReactNode }) => {
	const { user, logout } = useAuthStore()
	const navigate = useNavigate()
	const location = useLocation()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
	const { t } = useTranslation()

	const handleLogout = () => {
		logout()
		navigate("/login")
	}

	const isActive = (path: string) => location.pathname === path

	return (
		<div className='min-h-screen flex flex-col transition-colors duration-300'>
			{/* Navbar */}
			<nav className='sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between h-20'>
						{/* Logo */}
						<div className='flex items-center'>
							<Link to='/' className='flex items-center gap-3 group'>
								<div className='w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20 group-hover:scale-105 transition-transform'>
									<Scissors className='h-6 w-6' />
								</div>
								<span className='font-bold text-xl text-slate-900 tracking-tight'>
									Barber<span className='text-primary-600'>Book</span>
								</span>
							</Link>
						</div>

						{/* Desktop Navigation */}
						<div className='hidden md:flex items-center gap-6'>
							<div className='flex items-center gap-2 mr-4'>
								<LanguageSwitcher />
							</div>

							{user ? (
								<>
									<div className='flex items-center gap-6 mr-4'>
										{user.role === "barber" && (
											<Link
												to='/dashboard'
												className={clsx(
													"flex items-center gap-2 text-sm font-medium transition-colors",
													isActive("/dashboard")
														? "text-primary-600"
														: "text-slate-600 hover:text-slate-900"
												)}
											>
												<Calendar className='h-4 w-4' />
												{t("nav.dashboard")}
											</Link>
										)}
										<Link
											to='/bookings'
											className={clsx(
												"flex items-center gap-2 text-sm font-medium transition-colors",
												isActive("/bookings")
													? "text-primary-600"
													: "text-slate-600 hover:text-slate-900"
											)}
										>
											<Clock className='h-4 w-4' />
											{t("nav.my_appointments")}
										</Link>
										{user.role !== "barber" && (
											<Link
												to='/favorites'
												className={clsx(
													"flex items-center gap-2 text-sm font-medium transition-colors",
													isActive("/favorites")
														? "text-primary-600"
														: "text-slate-600 hover:text-slate-900"
												)}
											>
												<Heart className='h-4 w-4' />
												{t("nav.favorites")}
											</Link>
										)}
									</div>

									<div className='h-8 w-px bg-slate-200'></div>

									<div className='flex items-center gap-4'>
										<div className='flex flex-col items-end'>
											<span className='text-sm font-semibold text-slate-900'>
												{user.name}
											</span>
											<span className='text-xs text-slate-500 capitalize'>
												{user.role}
											</span>
										</div>
										<img
											src={user.avatarUrl}
											alt={user.name}
											className='w-10 h-10 rounded-full border-2 border-white shadow-sm'
										/>
										<button
											onClick={handleLogout}
											className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all'
											title={t("nav.logout")}
										>
											<LogOut className='h-5 w-5' />
										</button>
									</div>
								</>
							) : (
								<div className='flex items-center gap-4'>
									<Link
										to='/login'
										className='text-slate-600 font-medium hover:text-slate-900 transition-colors'
									>
										{t("nav.login")}
									</Link>
									<Link
										to='/register'
										className='btn-primary py-2.5 px-5 text-sm shadow-none'
									>
										{t("nav.register")}
									</Link>
								</div>
							)}
						</div>

						{/* Mobile menu button */}
						<div className='flex items-center md:hidden gap-4'>
							<LanguageSwitcher />
							<button
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								className='p-2 rounded-lg text-slate-600 hover:bg-slate-100'
							>
								{isMobileMenuOpen ? (
									<X className='h-6 w-6' />
								) : (
									<Menu className='h-6 w-6' />
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMobileMenuOpen && (
					<div className='md:hidden border-t border-slate-100 bg-white'>
						<div className='px-4 pt-2 pb-6 space-y-2'>
							{user ? (
								<>
									<div className='flex items-center gap-3 p-3 mb-4 bg-slate-50 rounded-xl'>
										<img
											src={user.avatarUrl}
											alt={user.name}
											className='w-10 h-10 rounded-full'
										/>
										<div>
											<div className='font-semibold text-slate-900'>{user.name}</div>
											<div className='text-xs text-slate-500 capitalize'>{user.role}</div>
										</div>
									</div>
									{user.role === "barber" && (
										<Link
											to='/dashboard'
											onClick={() => setIsMobileMenuOpen(false)}
											className='block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50'
										>
											{t("nav.dashboard")}
										</Link>
									)}
									<Link
										to='/bookings'
										onClick={() => setIsMobileMenuOpen(false)}
										className='block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50'
									>
										{t("nav.my_appointments")}
									</Link>
									<Link
										to='/favorites'
										onClick={() => setIsMobileMenuOpen(false)}
										className='block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50'
									>
										{t("nav.favorites")}
									</Link>
									<button
										onClick={() => {
											handleLogout()
											setIsMobileMenuOpen(false)
										}}
										className='w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50'
									>
										{t("nav.logout")}
									</button>
								</>
							) : (
								<div className='space-y-3 mt-4'>
									<Link
										to='/login'
										onClick={() => setIsMobileMenuOpen(false)}
										className='block w-full text-center px-4 py-2 border border-slate-200 rounded-xl font-medium text-slate-700'
									>
										{t("nav.login")}
									</Link>
									<Link
										to='/register'
										onClick={() => setIsMobileMenuOpen(false)}
										className='block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-xl font-medium'
									>
										{t("nav.register")}
									</Link>
								</div>
							)}
						</div>
					</div>
				)}
			</nav>

			{/* Main Content */}
			<main className='flex-grow'>{children}</main>

			{/* Footer */}
			<footer className='bg-white border-t border-slate-200 pt-16 pb-8'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-1 md:grid-cols-4 gap-12 mb-12'>
						<div className='col-span-1 md:col-span-1'>
							<div className='flex items-center gap-2 mb-4'>
								<div className='w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white'>
									<Scissors className='h-5 w-5' />
								</div>
								<span className='font-bold text-lg text-slate-900'>BarberBook</span>
							</div>
							<p className='text-slate-500 text-sm leading-relaxed'>
								{t("footer.description")}
							</p>
						</div>
						<div>
							<h3 className='font-semibold text-slate-900 mb-4'>{t("footer.product")}</h3>
							<ul className='space-y-2 text-sm text-slate-500'>
								<li>
									<Link to='/features' className='hover:text-primary-600'>
										{t("footer.features")}
									</Link>
								</li>
								<li>
									<Link to='/for-barbers' className='hover:text-primary-600'>
										{t("footer.for_barbers")}
									</Link>
								</li>
								<li>
									<Link to='/pricing' className='hover:text-primary-600'>
										{t("footer.pricing")}
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className='font-semibold text-slate-900 mb-4'>{t("footer.company")}</h3>
							<ul className='space-y-2 text-sm text-slate-500'>
								<li>
									<Link to='/about' className='hover:text-primary-600'>
										{t("footer.about_us")}
									</Link>
								</li>
								<li>
									<Link to='/careers' className='hover:text-primary-600'>
										{t("footer.careers")}
									</Link>
								</li>
								<li>
									<Link to='/contact' className='hover:text-primary-600'>
										{t("footer.contact")}
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className='font-semibold text-slate-900 mb-4'>{t("footer.legal")}</h3>
							<ul className='space-y-2 text-sm text-slate-500'>
								<li>
									<Link to='/privacy' className='hover:text-primary-600'>
										{t("footer.privacy")}
									</Link>
								</li>
								<li>
									<Link to='/terms' className='hover:text-primary-600'>
										{t("footer.terms")}
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className='border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
						<p className='text-slate-400 text-sm'>{t("footer.copyright")}</p>
						<div className='flex gap-6'>
							{/* Social icons placeholders */}
							<div className='w-5 h-5 bg-slate-200 rounded-full'></div>
							<div className='w-5 h-5 bg-slate-200 rounded-full'></div>
							<div className='w-5 h-5 bg-slate-200 rounded-full'></div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	)
}
