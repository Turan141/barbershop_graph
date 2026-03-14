import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { api } from "@/services/api"
import { Users, Scissors, Calendar, Activity, XCircle, Search, Save } from "lucide-react"
import { toast } from "react-hot-toast"
import { format } from "date-fns"

interface AdminStats {
	totalUsers: number
	totalBarbers: number
	totalBookings: number
	activeSubscriptions: number
}

interface AdminBarberProfile {
	id: string
	userId: string
	user: { id: string; name: string; email: string; phone: string | null }
	subscriptionStatus: string
	subscriptionPlan: string | null
	subscriptionEndDate: string | null
	createdAt: string
	_count: { bookings: number }
}

export default function AdminDashboardPage() {
	const { user } = useAuthStore()
	const navigate = useNavigate()

	const isUserAdmin = (user as any)?.role === "admin"

	const [stats, setStats] = useState<AdminStats | null>(null)
	const [barbers, setBarbers] = useState<AdminBarberProfile[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState("")

	const [editingBarber, setEditingBarber] = useState<AdminBarberProfile | null>(null)
	const [editStatus, setEditStatus] = useState("")
	const [editPlan, setEditPlan] = useState("")
	const [editEndDate, setEditEndDate] = useState("")

	useEffect(() => {
		if (!isUserAdmin) {
			toast.error("Unauthorized access")
			navigate("/")
			return
		}

		loadData()
	}, [isUserAdmin, navigate])

	const loadData = async () => {
		try {
			setLoading(true)
			const [statsRes, barbersRes] = await Promise.all([
				api.admin.getStats(),
				api.admin.getBarbers()
			])
			setStats(statsRes)
			setBarbers(barbersRes)
		} catch (error) {
			toast.error("Failed to load admin data")
		} finally {
			setLoading(false)
		}
	}

	const handleSaveSubscription = async () => {
		if (!editingBarber) return

		try {
			await api.admin.updateSubscription(editingBarber.id, {
				status: editStatus,
				plan: editPlan,
				endDate: editEndDate || null
			})
			toast.success("Subscription updated!")
			setEditingBarber(null)
			loadData()
		} catch (error) {
			toast.error("Failed to update subscription")
		}
	}

	const openEditModal = (barber: AdminBarberProfile) => {
		setEditingBarber(barber)
		setEditStatus(barber.subscriptionStatus)
		setEditPlan(barber.subscriptionPlan || "basic")
		setEditEndDate(
			barber.subscriptionEndDate
				? new Date(barber.subscriptionEndDate).toISOString().split("T")[0]
				: ""
		)
	}

	const filteredBarbers = barbers.filter(
		(b) =>
			b.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			b.user.email.toLowerCase().includes(searchTerm.toLowerCase())
	)

	if (loading) return <div className='p-8 text-center'>Loading Admin CRM...</div>
	if (!isUserAdmin) return null

	return (
		<div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
			<h1 className='text-3xl font-bold text-gray-900 mb-8'>Admin Dashboard CRM</h1>

			{stats && (
				<div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-12'>
					<div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center'>
						<div className='bg-blue-100 p-3 rounded-lg mr-4'>
							<Users className='w-6 h-6 text-blue-600' />
						</div>
						<div>
							<p className='text-sm text-gray-500 font-medium'>Total Clients</p>
							<p className='text-2xl font-bold text-gray-900'>{stats.totalUsers}</p>
						</div>
					</div>
					<div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center'>
						<div className='bg-purple-100 p-3 rounded-lg mr-4'>
							<Scissors className='w-6 h-6 text-purple-600' />
						</div>
						<div>
							<p className='text-sm text-gray-500 font-medium'>Total Barbers</p>
							<p className='text-2xl font-bold text-gray-900'>{stats.totalBarbers}</p>
						</div>
					</div>
					<div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center'>
						<div className='bg-green-100 p-3 rounded-lg mr-4'>
							<Activity className='w-6 h-6 text-green-600' />
						</div>
						<div>
							<p className='text-sm text-gray-500 font-medium'>Active Subs</p>
							<p className='text-2xl font-bold text-gray-900'>
								{stats.activeSubscriptions}
							</p>
						</div>
					</div>
					<div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center'>
						<div className='bg-orange-100 p-3 rounded-lg mr-4'>
							<Calendar className='w-6 h-6 text-orange-600' />
						</div>
						<div>
							<p className='text-sm text-gray-500 font-medium'>Total Bookings</p>
							<p className='text-2xl font-bold text-gray-900'>{stats.totalBookings}</p>
						</div>
					</div>
				</div>
			)}

			<div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
				<div className='p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50'>
					<h2 className='text-xl font-bold text-gray-900'>Barbers Management</h2>
					<div className='relative'>
						<Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
						<input
							type='text'
							placeholder='Search barbers...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64'
						/>
					</div>
				</div>

				<div className='overflow-x-auto'>
					<table className='w-full text-left border-collapse'>
						<thead>
							<tr className='bg-gray-50 text-gray-500 text-sm uppercase tracking-wider'>
								<th className='px-6 py-4 font-medium'>Barber</th>
								<th className='px-6 py-4 font-medium'>Status & Plan</th>
								<th className='px-6 py-4 font-medium'>Joined</th>
								<th className='px-6 py-4 font-medium'>Bookings</th>
								<th className='px-6 py-4 font-medium text-right'>Actions</th>
							</tr>
						</thead>
						<tbody className='bg-white divide-y divide-gray-100'>
							{filteredBarbers.map((barber) => (
								<tr key={barber.id} className='hover:bg-gray-50 transition-colors'>
									<td className='px-6 py-4'>
										<div className='font-medium text-gray-900'>{barber.user.name}</div>
										<div className='text-sm text-gray-500'>{barber.user.email}</div>
										<div className='text-xs text-gray-400'>
											{barber.user.phone || "No phone"}
										</div>
									</td>
									<td className='px-6 py-4'>
										<span
											className={
												"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 " +
												(barber.subscriptionStatus === "active"
													? "bg-green-100 text-green-800"
													: barber.subscriptionStatus === "trial"
														? "bg-blue-100 text-blue-800"
														: "bg-red-100 text-red-800")
											}
										>
											{barber.subscriptionStatus.toUpperCase()}
										</span>
										<span className='text-sm font-semibold ml-2 text-gray-700'>
											{barber.subscriptionPlan
												? barber.subscriptionPlan.toUpperCase()
												: "N/A"}
										</span>
										{barber.subscriptionEndDate && (
											<div className='text-xs text-gray-500 mt-1'>
												Expires:{" "}
												{format(new Date(barber.subscriptionEndDate), "MMM d, yyyy")}
											</div>
										)}
									</td>
									<td className='px-6 py-4 text-sm text-gray-500'>
										{format(new Date(barber.createdAt), "MMM d, yyyy")}
									</td>
									<td className='px-6 py-4'>
										<span className='inline-flex items-center justify-center px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold'>
											{barber._count.bookings}
										</span>
									</td>
									<td className='px-6 py-4 text-right'>
										<button
											onClick={() => openEditModal(barber)}
											className='text-indigo-600 hover:text-indigo-900 font-medium text-sm border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors'
										>
											Manage
										</button>
									</td>
								</tr>
							))}
							{filteredBarbers.length === 0 && (
								<tr>
									<td colSpan={5} className='px-6 py-8 text-center text-gray-500'>
										No barbers found matching your search.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{editingBarber && (
				<div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden'>
						<div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50'>
							<h3 className='text-lg font-bold text-gray-900'>Manage Subscription</h3>
							<button
								onClick={() => setEditingBarber(null)}
								className='text-gray-400 hover:text-gray-600'
							>
								<XCircle className='w-6 h-6' />
							</button>
						</div>
						<div className='p-6 space-y-4'>
							<div>
								<p className='text-sm text-gray-500 mb-1'>Barber Name</p>
								<p className='font-semibold text-gray-900'>{editingBarber.user.name}</p>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Status
								</label>
								<select
									className='w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border'
									value={editStatus}
									onChange={(e) => setEditStatus(e.target.value)}
								>
									<option value='trial'>Trial</option>
									<option value='active'>Active</option>
									<option value='expired'>Expired</option>
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Plan
								</label>
								<select
									className='w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border'
									value={editPlan}
									onChange={(e) => setEditPlan(e.target.value)}
								>
									<option value='demo'>Demo</option>
									<option value='basic'>Basic</option>
									<option value='standard'>Standard</option>
									<option value='pro'>Pro</option>
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									End Date (Leave blank for lifetime)
								</label>
								<input
									type='date'
									className='w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border'
									value={editEndDate}
									onChange={(e) => setEditEndDate(e.target.value)}
								/>
							</div>
						</div>
						<div className='px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3'>
							<button
								onClick={() => setEditingBarber(null)}
								className='px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors'
							>
								Cancel
							</button>
							<button
								onClick={handleSaveSubscription}
								className='px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-colors flex items-center'
							>
								<Save className='w-4 h-4 mr-2' />
								Save
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
