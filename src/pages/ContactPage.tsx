import { Mail, MapPin, Phone } from "lucide-react"
import { useTranslation } from "react-i18next"

export const ContactPage = () => {
	const { t } = useTranslation()

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='text-center mb-16'>
				<h1 className='text-4xl font-bold text-slate-900 mb-4'>
					{t("pages.contact.title")}
				</h1>
				<p className='text-xl text-slate-600 max-w-2xl mx-auto'>
					{t("pages.contact.subtitle")}
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto'>
				<div>
					<h2 className='text-2xl font-bold text-slate-900 mb-6'>
						{t("pages.contact.get_in_touch")}
					</h2>
					<div className='space-y-6'>
						<div className='flex items-start gap-4'>
							<div className='w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 flex-shrink-0'>
								<Mail className='h-5 w-5' />
							</div>
							<div>
								<h3 className='font-semibold text-slate-900'>
									{t("pages.contact.email.title")}
								</h3>
								<p className='text-slate-600'>tvelievdev@gmail.com</p>
								<p className='text-slate-500 text-sm mt-1'>
									{t("pages.contact.email.desc")}
								</p>
							</div>
						</div>
						<div className='flex items-start gap-4'>
							<div className='w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 flex-shrink-0'>
								<Phone className='h-5 w-5' />
							</div>
							<div>
								<h3 className='font-semibold text-slate-900'>
									{t("pages.contact.phone.title")}
								</h3>
								<p className='text-slate-600'>+994 55 792 05 50</p>
								<p className='text-slate-500 text-sm mt-1'>
									{t("pages.contact.phone.desc")}
								</p>
							</div>
						</div>
						<div className='flex items-start gap-4'>
							<div className='w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 flex-shrink-0'>
								<MapPin className='h-5 w-5' />
							</div>
							<div>
								<h3 className='font-semibold text-slate-900'>
									{t("pages.contact.office.title")}
								</h3>
								<p className='text-slate-600'>
									123 Nizami Street
									<br />
									Baku, Azerbaijan
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className='card p-8 bg-white'>
					<form className='space-y-4'>
						<div>
							<label className='block text-sm font-medium text-slate-700 mb-1'>
								{t("pages.contact.form.name")}
							</label>
							<input
								type='text'
								className='input w-full'
								placeholder={t("pages.contact.form.name_placeholder")}
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-slate-700 mb-1'>
								{t("pages.contact.form.email")}
							</label>
							<input
								type='email'
								className='input w-full'
								placeholder={t("pages.contact.form.email_placeholder")}
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-slate-700 mb-1'>
								{t("pages.contact.form.message")}
							</label>
							<textarea
								className='input w-full h-32 resize-none'
								placeholder={t("pages.contact.form.message_placeholder")}
							></textarea>
						</div>
						<button type='submit' className='btn btn-primary w-full'>
							{t("pages.contact.form.submit")}
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}
