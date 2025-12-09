import { useState, FormEvent, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "../store/authStore"
import { api } from "../services/api"
import { Scissors, ArrowRight, Mail, Lock } from "lucide-react"

export const LoginPage = () => {
	const { t } = useTranslation()
	const [email, setEmail] = useState("client@test.com")
	const [password, setPassword] = useState("password")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const login = useAuthStore((state) => state.login)
	const user = useAuthStore((state) => state.user)
	const navigate = useNavigate()
	const location = useLocation()

	// Redirect if already logged in
	useEffect(() => {
		if (user) {
			if (location.state?.from) {
				navigate(location.state.from, { replace: true })
			} else if (user.role === "barber") {
				navigate("/dashboard", { replace: true })
			} else {
				navigate("/", { replace: true })
			}
		}
	}, [user, navigate, location])

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError("")
		try {
			const { user, token } = await api.auth.login(email, password)
			login(user, token)

			// Redirect logic
			if (location.state?.from) {
				navigate(location.state.from, { replace: true })
			} else {
				// Default redirects based on role
				if (user.role === "barber") {
					navigate("/bookings", { replace: true })
				} else {
					navigate("/", { replace: true })
				}
			}
		} catch (err) {
			setError(t("auth.login_failed"))
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<div className='mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-600/30 mb-6'>
						<Scissors className='h-8 w-8' />
					</div>
					<h2 className='text-3xl font-bold text-slate-900 tracking-tight'>
						{t("auth.welcome")}
					</h2>
					<p className='mt-2 text-sm text-slate-600'>{t("auth.login_subtitle")}</p>
				</div>

				<div className='card p-8 shadow-xl border-0 bg-white'>
					<form className='space-y-6' onSubmit={handleSubmit}>
						{error && (
							<div className='bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium'>
								{error}
							</div>
						)}

						<div className='space-y-4'>
							<div>
								<label
									htmlFor='email'
									className='block text-sm font-medium text-slate-700 mb-1'
								>
									{t("auth.email_label")}
								</label>
								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
										<Mail className='h-5 w-5 text-slate-400' />
									</div>
									<input
										id='email'
										name='email'
										type='email'
										required
										className='input-field pl-10'
										placeholder={t("auth.email_placeholder")}
										value={email}
										onChange={(e) => setEmail(e.target.value)}
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor='password'
									className='block text-sm font-medium text-slate-700 mb-1'
								>
									{t("auth.password_label")}
								</label>
								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
										<Lock className='h-5 w-5 text-slate-400' />
									</div>
									<input
										id='password'
										name='password'
										type='password'
										required
										className='input-field pl-10'
										placeholder='••••••••'
										value={password}
										onChange={(e) => setPassword(e.target.value)}
									/>
								</div>
								<div className='flex justify-end mt-1'>
									<a
										href='#'
										className='text-sm font-medium text-primary-600 hover:text-primary-500'
									>
										{t("auth.forgot_password")}
									</a>
								</div>
							</div>
						</div>

						<button
							type='submit'
							disabled={loading}
							className='btn-primary w-full flex justify-center items-center gap-2'
						>
							{loading ? t("auth.logging_in") : t("auth.login_button")}
							{!loading && <ArrowRight className='w-4 h-4' />}
						</button>
					</form>

					<div className='mt-8'>
						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-slate-200' />
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='px-2 bg-white text-slate-500'>
									{t("auth.demo_accounts")}
								</span>
							</div>
						</div>

						<div className='mt-6 grid grid-cols-2 gap-3'>
							<button
								onClick={() => setEmail("client@test.com")}
								className='flex justify-center items-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors'
							>
								{t("auth.client_demo")}
							</button>
							<button
								onClick={() => setEmail("barber@test.com")}
								className='flex justify-center items-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors'
							>
								{t("auth.barber_demo")}
							</button>
						</div>
					</div>
				</div>

				<p className='text-center text-sm text-slate-600'>
					{t("auth.no_account")}{" "}
					<Link
						to='/register'
						className='font-medium text-primary-600 hover:text-primary-500'
					>
						{t("auth.register_link")}
					</Link>
				</p>
			</div>
		</div>
	)
}
