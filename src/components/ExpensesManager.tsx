import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Trash2, TrendingDown } from "lucide-react"
import { format } from "date-fns"
import { enUS, ru, az } from "date-fns/locale"
import { Modal } from "./Modal"
import toast from "react-hot-toast"

const locales: Record<string, any> = {
	en: enUS,
	ru: ru,
	az: az
}

interface Expense {
	id: string
	amount: number
	category: string
	date: string
	note?: string
}

interface ExpensesManagerProps {
	barberId: string
}

export const ExpensesManager: React.FC<ExpensesManagerProps> = ({ barberId }) => {
	const { t, i18n } = useTranslation()
	const [expenses, setExpenses] = useState<Expense[]>([])
	const [loading, setLoading] = useState(true)
	const [isAddModalOpen, setIsAddModalOpen] = useState(false)
	const [filter] = useState<"month" | "all">("month")

	// Form state
	const [amount, setAmount] = useState("")
	const [category, setCategory] = useState("supplies")
	const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
	const [note, setNote] = useState("")
	const [submitting, setSubmitting] = useState(false)

	const categories = [
		{ id: "rent", label: t("expenses.categories.rent") || "Rent" },
		{ id: "supplies", label: t("expenses.categories.supplies") || "Supplies" },
		{ id: "utilities", label: t("expenses.categories.utilities") || "Utilities" },
		{ id: "marketing", label: t("expenses.categories.marketing") || "Marketing" },
		{ id: "other", label: t("expenses.categories.other") || "Other" }
	]

	useEffect(() => {
		fetchExpenses()
	}, [barberId, filter])

	const fetchExpenses = async () => {
		setLoading(true)
		try {
			// Mock API call for now until backend is ready
			// const data = await api.expenses.list(barberId, filter)
			// setExpenses(data)

			// Temporary mock data
			setTimeout(() => {
				setExpenses([
					{
						id: "1",
						amount: 150,
						category: "supplies",
						date: "2025-12-28",
						note: "Shampoo and blades"
					},
					{
						id: "2",
						amount: 500,
						category: "rent",
						date: "2025-12-01",
						note: "December Rent"
					}
				])
				setLoading(false)
			}, 500)
		} catch (error) {
			console.error("Failed to fetch expenses", error)
			setLoading(false)
		}
	}

	const handleAddExpense = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!amount || !date) return

		setSubmitting(true)
		try {
			// Mock API call
			// await api.expenses.create({ barberId, amount: Number(amount), category, date, note })

			const newExpense: Expense = {
				id: Math.random().toString(36).substr(2, 9),
				amount: Number(amount),
				category,
				date,
				note
			}

			setExpenses([newExpense, ...expenses])
			toast.success(t("expenses.added_success") || "Expense added successfully")
			setIsAddModalOpen(false)

			// Reset form
			setAmount("")
			setCategory("supplies")
			setNote("")
			setDate(format(new Date(), "yyyy-MM-dd"))
		} catch (error) {
			toast.error(t("expenses.add_error") || "Failed to add expense")
		} finally {
			setSubmitting(false)
		}
	}

	const handleDelete = async (id: string) => {
		if (!confirm(t("common.confirm_delete") || "Are you sure?")) return

		try {
			// await api.expenses.delete(id)
			setExpenses(expenses.filter((e) => e.id !== id))
			toast.success(t("expenses.deleted_success") || "Expense deleted")
		} catch (error) {
			toast.error(t("expenses.delete_error") || "Failed to delete expense")
		}
	}

	const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

	if (loading)
		return <div className='p-8 text-center text-slate-500'>{t("common.loading")}</div>

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-xl font-bold text-slate-900'>
						{t("expenses.title") || "Expenses"}
					</h2>
					<p className='text-sm text-slate-500'>
						{t("expenses.subtitle") || "Track your business costs"}
					</p>
				</div>
				<button
					onClick={() => setIsAddModalOpen(true)}
					className='btn-primary flex items-center gap-2'
				>
					<Plus className='w-4 h-4' />
					{t("expenses.add_btn") || "Add Expense"}
				</button>
			</div>

			{/* Summary Cards */}
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
				<div className='bg-red-50 p-4 rounded-xl border border-red-100'>
					<div className='flex items-center gap-3 mb-2'>
						<div className='p-2 bg-white rounded-lg shadow-sm'>
							<TrendingDown className='w-5 h-5 text-red-500' />
						</div>
						<span className='text-sm font-medium text-red-700'>
							{t("expenses.total_cost") || "Total Cost"}
						</span>
					</div>
					<div className='text-2xl font-bold text-slate-900'>
						₼{totalExpenses.toFixed(2)}
					</div>
				</div>
			</div>

			{/* List */}
			<div className='bg-white rounded-xl border border-slate-200 overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full text-left text-sm'>
						<thead className='bg-slate-50 border-b border-slate-100'>
							<tr>
								<th className='px-6 py-4 font-semibold text-slate-700'>
									{t("expenses.date") || "Date"}
								</th>
								<th className='px-6 py-4 font-semibold text-slate-700'>
									{t("expenses.category") || "Category"}
								</th>
								<th className='px-6 py-4 font-semibold text-slate-700'>
									{t("expenses.note") || "Note"}
								</th>
								<th className='px-6 py-4 font-semibold text-slate-700 text-right'>
									{t("expenses.amount") || "Amount"}
								</th>
								<th className='px-6 py-4 font-semibold text-slate-700'></th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100'>
							{expenses.length === 0 ? (
								<tr>
									<td colSpan={5} className='px-6 py-8 text-center text-slate-500'>
										{t("expenses.no_data") || "No expenses recorded yet."}
									</td>
								</tr>
							) : (
								expenses.map((expense) => (
									<tr key={expense.id} className='hover:bg-slate-50'>
										<td className='px-6 py-4 text-slate-600'>
											{format(new Date(expense.date), "d MMM yyyy", {
												locale: locales[i18n.language] || enUS
											})}
										</td>
										<td className='px-6 py-4'>
											<span className='px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize'>
												{t(`expenses.categories.${expense.category}`) || expense.category}
											</span>
										</td>
										<td className='px-6 py-4 text-slate-600 max-w-xs truncate'>
											{expense.note || "-"}
										</td>
										<td className='px-6 py-4 text-right font-medium text-slate-900'>
											₼{expense.amount.toFixed(2)}
										</td>
										<td className='px-6 py-4 text-right'>
											<button
												onClick={() => handleDelete(expense.id)}
												className='text-slate-400 hover:text-red-500 transition-colors'
											>
												<Trash2 className='w-4 h-4' />
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			<Modal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				title={t("expenses.add_title") || "Add New Expense"}
			>
				<form onSubmit={handleAddExpense} className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-slate-700 mb-1'>
							{t("expenses.amount") || "Amount"} (₼)
						</label>
						<input
							type='number'
							step='0.01'
							required
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							className='w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none'
							placeholder='0.00'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-slate-700 mb-1'>
							{t("expenses.category") || "Category"}
						</label>
						<select
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							className='w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white'
						>
							{categories.map((c) => (
								<option key={c.id} value={c.id}>
									{c.label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className='block text-sm font-medium text-slate-700 mb-1'>
							{t("expenses.date") || "Date"}
						</label>
						<input
							type='date'
							required
							value={date}
							onChange={(e) => setDate(e.target.value)}
							className='w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-slate-700 mb-1'>
							{t("expenses.note") || "Note"} (Optional)
						</label>
						<textarea
							value={note}
							onChange={(e) => setNote(e.target.value)}
							className='w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none'
							rows={3}
							placeholder='e.g. Monthly rent payment'
						/>
					</div>

					<div className='flex gap-3 pt-4'>
						<button
							type='button'
							onClick={() => setIsAddModalOpen(false)}
							className='flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors'
						>
							{t("common.cancel") || "Cancel"}
						</button>
						<button
							type='submit'
							disabled={submitting}
							className='flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20'
						>
							{submitting ? t("common.saving") : t("common.save")}
						</button>
					</div>
				</form>
			</Modal>
		</div>
	)
}
