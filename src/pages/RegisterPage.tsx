import { useState, FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "../store/authStore"
import { api } from "../services/api"
import { Scissors, User, Mail, Briefcase, Lock } from "lucide-react"

export const RegisterPage = () => {
	const { t } = useTranslation()
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [role, setRole] = useState<"client" | "barber">("client")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const login = useAuthStore((state) => state.login)
	const navigate = useNavigate()

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError("")
		try {
			const { user, token } = await api.auth.register({ name, email, password, role })
			login(user, token)
			navigate(role === "barber" ? "/dashboard" : "/")
		} catch (err: any) {
			console.error("Registration error:", err)
			let errorMessage = t("auth.registration_failed")
			try {
				// Try to parse the error message if it's a JSON string
				const parsed = JSON.parse(err.message)
				if (parsed.error) errorMessage = parsed.error
			} catch (e) {
				// If not JSON, use the message directly if it exists
				if (err.message && err.message !== "undefined") errorMessage = err.message
			}
			setError(errorMessage)
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
						{t("auth.create_account")}
					</h2>
					<p className='mt-2 text-sm text-slate-600'>{t("auth.register_subtitle")}</p>
				</div>

				<div className='card p-8 shadow-xl border-0 bg-white'>
					<form className='space-y-6' onSubmit={handleSubmit}>
						{error && (
							<div className='bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium'>
								{error}
							</div>
						)}

						<div>
							<label
								htmlFor='name'
								className='block text-sm font-medium text-slate-700 mb-1'
							>
								{t("auth.full_name_label")}
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<User className='h-5 w-5 text-slate-400' />
								</div>
								<input
									id='name'
									name='name'
									type='text'
									required
									className='input pl-10 w-full'
									placeholder={t("auth.name_placeholder")}
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>
						</div>

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
									className='input pl-10 w-full'
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
									className='input pl-10 w-full'
									placeholder='••••••••'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
						</div>

						<div>
							<label className='block text-sm font-medium text-slate-700 mb-3'>
								{t("auth.i_am_a")}
							</label>
							<div className='grid grid-cols-2 gap-4'>
								<button
									type='button'
									onClick={() => setRole("client")}
									className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
										role === "client"
											? "border-primary-600 bg-primary-50 text-primary-700"
											: "border-slate-200 hover:border-slate-300 text-slate-600"
									}`}
								>
									<User
										className={`h-6 w-6 mb-2 ${
											role === "client" ? "text-primary-600" : "text-slate-400"
										}`}
									/>
									<span className='font-medium'>{t("auth.role_client")}</span>
								</button>
								<button
									type='button'
									onClick={() => setRole("barber")}
									className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
										role === "barber"
											? "border-primary-600 bg-primary-50 text-primary-700"
											: "border-slate-200 hover:border-slate-300 text-slate-600"
									}`}
								>
									<Briefcase
										className={`h-6 w-6 mb-2 ${
											role === "barber" ? "text-primary-600" : "text-slate-400"
										}`}
									/>
									<span className='font-medium'>{t("auth.role_barber")}</span>
								</button>
							</div>
						</div>

						<button
							type='submit'
							disabled={loading}
							className='btn btn-primary w-full flex justify-center py-3 text-base'
						>
							{loading ? t("auth.creating_account") : t("auth.sign_up")}
						</button>
					</form>

					<div className='mt-6 text-center'>
						<p className='text-sm text-slate-600'>
							{t("auth.already_have_account")}{" "}
							<Link
								to='/login'
								className='font-medium text-primary-600 hover:text-primary-500'
							>
								{t("auth.sign_in_link")}
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
