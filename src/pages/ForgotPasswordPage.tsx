import { FormEvent, useState } from "react"
import { Link } from "react-router-dom"
import { Mail, ArrowRight, Scissors } from "lucide-react"
import { useTranslation } from "react-i18next"
import { api } from "@/services/api"

export const ForgotPasswordPage = () => {
	const { t } = useTranslation()
	const [email, setEmail] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setError("")
		setSuccess("")
		setLoading(true)

		try {
			const response = await api.auth.forgotPassword(email)
			setSuccess(response.message || t("auth.reset_email_sent"))
		} catch (err: any) {
			setError(err?.message || t("auth.reset_request_failed"))
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
						{t("auth.forgot_password_title")}
					</h2>
					<p className='mt-2 text-sm text-slate-600'>
						{t("auth.forgot_password_subtitle")}
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
									type='email'
									required
									className='input-field pl-10'
									placeholder={t("auth.email_placeholder")}
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
						</div>

						<button
							type='submit'
							disabled={loading}
							className='btn-primary w-full flex justify-center items-center gap-2'
						>
							{loading ? t("auth.generating_reset_link") : t("auth.send_reset_link")}
							{!loading && <ArrowRight className='w-4 h-4' />}
						</button>
					</form>

					<p className='text-center text-sm text-slate-600 mt-6'>
						{t("auth.remember_password")}{" "}
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
