import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Search, User, Mail, Calendar, DollarSign, FileText, X, Plus } from "lucide-react"
import { api } from "../services/api"
import { Modal } from "./Modal"

interface Client {
	id: string
	name: string
	email: string
	avatarUrl?: string
	totalBookings: number
	totalRevenue: number
	lastBookingDate: string
	notes: string
	tags: string[]
}

interface ClientListProps {
	barberId: string
}

export const ClientList: React.FC<ClientListProps> = ({ barberId }) => {
	const { t } = useTranslation()
	const [clients, setClients] = useState<Client[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedClient, setSelectedClient] = useState<Client | null>(null)

	// Edit states
	const [notes, setNotes] = useState("")
	const [tags, setTags] = useState<string[]>([])
	const [newTag, setNewTag] = useState("")
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		fetchClients()
	}, [barberId])

	const fetchClients = async () => {
		try {
			const data = await api.barbers.getClients(barberId)
			setClients(data)
		} catch (error) {
			console.error("Failed to fetch clients", error)
		} finally {
			setLoading(false)
		}
	}

	const handleClientClick = (client: Client) => {
		setSelectedClient(client)
		setNotes(client.notes || "")
		setTags(client.tags || [])
	}

	const handleSaveNote = async () => {
		if (!selectedClient) return
		setSaving(true)
		try {
			await api.barbers.saveClientNote(barberId, selectedClient.id, {
				notes,
				tags
			})

			// Update local state
			setClients(
				clients.map((c) => (c.id === selectedClient.id ? { ...c, notes, tags } : c))
			)
			setSelectedClient({ ...selectedClient, notes, tags })
		} catch (error) {
			console.error("Failed to save note", error)
		} finally {
			setSaving(false)
		}
	}

	const addTag = () => {
		if (newTag && !tags.includes(newTag)) {
			setTags([...tags, newTag])
			setNewTag("")
		}
	}

	const removeTag = (tagToRemove: string) => {
		setTags(tags.filter((tag) => tag !== tagToRemove))
	}

	const filteredClients = clients.filter(
		(client) =>
			client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			client.email.toLowerCase().includes(searchTerm.toLowerCase())
	)

	if (loading)
		return <div className='p-8 text-center text-slate-500'>{t("common.loading")}</div>

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-bold text-slate-900'>
					{t("dashboard.clients.title")}
				</h2>
				<div className='relative'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
					<input
						type='text'
						placeholder={t("dashboard.clients.search_placeholder")}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 w-64'
					/>
				</div>
			</div>

			{filteredClients.length === 0 ? (
				<div className='text-center py-12 bg-slate-50 rounded-2xl border border-slate-100'>
					<User className='w-12 h-12 text-slate-300 mx-auto mb-3' />
					<p className='text-slate-500'>{t("dashboard.clients.no_clients")}</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{filteredClients.map((client) => (
						<div
							key={client.id}
							onClick={() => handleClientClick(client)}
							className='bg-white p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group'
						>
							<div className='flex items-center gap-4 mb-4'>
								<div className='w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden'>
									{client.avatarUrl ? (
										<img
											src={client.avatarUrl}
											alt={client.name}
											className='w-full h-full object-cover'
										/>
									) : (
										<User className='w-6 h-6 text-slate-400' />
									)}
								</div>
								<div>
									<h3 className='font-semibold text-slate-900 group-hover:text-primary-600 transition-colors'>
										{client.name}
									</h3>
									<p className='text-xs text-slate-500'>{client.email}</p>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-2 text-sm mb-3'>
								<div className='bg-slate-50 p-2 rounded-lg'>
									<p className='text-xs text-slate-500 mb-1'>
										{t("dashboard.clients.bookings")}
									</p>
									<p className='font-medium text-slate-900'>{client.totalBookings}</p>
								</div>
								<div className='bg-slate-50 p-2 rounded-lg'>
									<p className='text-xs text-slate-500 mb-1'>
										{t("dashboard.clients.total_revenue")}
									</p>
									<p className='font-medium text-slate-900'>{client.totalRevenue} ₼</p>
								</div>
							</div>

							{client.tags && client.tags.length > 0 && (
								<div className='flex flex-wrap gap-1'>
									{client.tags.slice(0, 3).map((tag) => (
										<span
											key={tag}
											className='px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full'
										>
											{tag}
										</span>
									))}
									{client.tags.length > 3 && (
										<span className='px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full'>
											+{client.tags.length - 3}
										</span>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Client Details Modal */}
			<Modal
				isOpen={!!selectedClient}
				onClose={() => setSelectedClient(null)}
				title={t("dashboard.clients.details")}
			>
				{selectedClient && (
					<div className='space-y-6 p-8'>
						<div className='flex items-center gap-4 pb-6 border-b border-slate-100'>
							<div className='w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden'>
								{selectedClient.avatarUrl ? (
									<img
										src={selectedClient.avatarUrl}
										alt={selectedClient.name}
										className='w-full h-full object-cover'
									/>
								) : (
									<User className='w-8 h-8 text-slate-400' />
								)}
							</div>
							<div>
								<h3 className='text-xl font-bold text-slate-900'>
									{selectedClient.name}
								</h3>
								<div className='flex items-center gap-4 text-sm text-slate-500 mt-1'>
									<span className='flex items-center gap-1'>
										<Mail className='w-3 h-3' /> {selectedClient.email}
									</span>
									<span className='flex items-center gap-1'>
										<Calendar className='w-3 h-3' /> {t("dashboard.clients.last_visit")}:{" "}
										{selectedClient.lastBookingDate}
									</span>
								</div>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div className='bg-slate-50 p-4 rounded-xl border border-slate-100'>
								<div className='flex items-center gap-2 text-slate-500 mb-1'>
									<Calendar className='w-4 h-4' />
									<span className='text-sm font-medium'>
										{t("dashboard.clients.bookings")}
									</span>
								</div>
								<p className='text-2xl font-bold text-slate-900'>
									{selectedClient.totalBookings}
								</p>
							</div>
							<div className='bg-green-50 p-4 rounded-xl border border-green-100'>
								<div className='flex items-center gap-2 text-green-700 mb-1'>
									<DollarSign className='w-4 h-4' />
									<span className='text-sm font-medium'>
										{t("dashboard.clients.total_revenue")}
									</span>
								</div>
								<p className='text-2xl font-bold text-green-800'>
									{selectedClient.totalRevenue} ₼
								</p>
							</div>
						</div>

						<div>
							<label className='block text-sm font-medium text-slate-700 mb-2'>
								{t("dashboard.clients.tags")}
							</label>
							<div className='flex flex-wrap gap-2 mb-2'>
								{tags.map((tag) => (
									<span
										key={tag}
										className='px-2 py-1 bg-primary-50 text-primary-700 text-sm rounded-lg flex items-center gap-1'
									>
										{tag}
										<button
											onClick={() => removeTag(tag)}
											className='hover:text-primary-900'
										>
											<X className='w-3 h-3' />
										</button>
									</span>
								))}
							</div>
							<div className='flex gap-2'>
								<input
									type='text'
									value={newTag}
									onChange={(e) => setNewTag(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && addTag()}
									placeholder={t("dashboard.clients.add_tag")}
									className='flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500'
								/>
								<button
									onClick={addTag}
									className='px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors'
								>
									<Plus className='w-4 h-4' />
								</button>
							</div>
						</div>

						<div>
							<label className='block text-sm font-medium text-slate-700 mb-2'>
								{t("dashboard.clients.notes")}
							</label>
							<textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								className='w-full h-32 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none'
								placeholder={t("dashboard.clients.add_note")}
							/>
						</div>

						<div className='flex justify-end pt-4 border-t border-slate-100'>
							<button
								onClick={handleSaveNote}
								disabled={saving}
								className='px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2'
							>
								{saving ? (
									<div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
								) : (
									<FileText className='w-4 h-4' />
								)}
								{t("dashboard.clients.save_note")}
							</button>
						</div>
					</div>
				)}
			</Modal>
		</div>
	)
}
