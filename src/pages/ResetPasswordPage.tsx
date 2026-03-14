import { FormEvent, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Lock, ArrowRight, Scissors } from "lucide-react"
import { useTranslation } from "react-i18next"
import { api } from "@/services/api"

export const ResetPasswordPage = () => {
	const { t } = useTranslation()
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const token = useMemo(() => searchParams.get("token") || "", [searchParams])

	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setError("")
		setSuccess("")

		if (!token) {
			setError(t("auth.reset_token_missing"))
			return
		}

		if (password.length < 6) {
			setError(t("auth.password_min_length"))
			return
		}

		if (password !== confirmPassword) {
			setError(t("auth.password_mismatch"))
			return
		}

		setLoading(true)
		try {
			await api.auth.resetPassword(token, password)
			setSuccess(t("auth.password_reset_success"))
			setTimeout(() => navigate("/login"), 1200)
		} catch (err: any) {
			setError(err?.message || t("auth.password_reset_failed"))
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<div className='mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-600/30 mb-6'>
						<Scissors className='h-8 w-8' />
					</div>
					<h2 className='text-3xl font-bold text-slate-900 tracking-tight'>
						{t("auth.reset_password_title")}
					</h2>
					<p className='mt-2 text-sm text-slate-600'>
						{t("auth.reset_password_subtitle")}
					</p>
				</div>

				<div className='card p-8 shadow-xl border-0 bg-white'>
					<form className='space-y-6' onSubmit={onSubmit}>
						{error && (
							<div className='bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium'>
								{error}
							</div>
						)}
						{success && (
							<div className='bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm font-medium'>
								{success}
							</div>
						)}

						<div>
							<label
								htmlFor='password'
								className='block text-sm font-medium text-slate-700 mb-1'
							>
								{t("auth.new_password_label")}
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='h-5 w-5 text-slate-400' />
								</div>
								<input
									id='password'
									type='password'
									required
									className='input-field pl-10'
									placeholder='••••••••'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor='confirmPassword'
								className='block text-sm font-medium text-slate-700 mb-1'
							>
								{t("auth.confirm_new_password_label")}
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='h-5 w-5 text-slate-400' />
								</div>
								<input
									id='confirmPassword'
									type='password'
									required
									className='input-field pl-10'
									placeholder='••••••••'
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
								/>
							</div>
						</div>

						<button
							type='submit'
							disabled={loading}
							className='btn-primary w-full flex justify-center items-center gap-2'
						>
							{loading ? t("auth.resetting_password") : t("auth.reset_password_button")}
							{!loading && <ArrowRight className='w-4 h-4' />}
						</button>
					</form>

					<p className='text-center text-sm text-slate-600 mt-6'>
						{t("auth.back_to")}{" "}
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
	)
}
