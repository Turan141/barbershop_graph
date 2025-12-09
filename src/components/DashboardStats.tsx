import React, { useEffect, useState } from "react"
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer
} from "recharts"
import { api } from "../services/api"
import { useTranslation } from "react-i18next"
import { DollarSign, Users, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
	barberId: string
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ barberId }) => {
	const { t } = useTranslation()
	const [stats, setStats] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		api.barbers
			.getStats(barberId)
			.then(setStats)
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [barberId])

	if (loading) return <div className='animate-pulse h-64 bg-slate-100 rounded-xl'></div>

	if (!stats) {
		return (
			<div className='text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200'>
				<TrendingUp className='w-12 h-12 text-slate-300 mx-auto mb-3' />
				<h3 className='text-lg font-medium text-slate-900'>
					{t("dashboard.stats.no_data_title") || "No Stats Available"}
				</h3>
				<p className='text-slate-500'>
					{t("dashboard.stats.no_data_desc") ||
						"Start accepting bookings to see your analytics here."}
				</p>
			</div>
		)
	}

	const hasData =
		stats.totalClients > 0 || stats.today.revenue > 0 || stats.month.revenue > 0

	if (!hasData) {
		return (
			<div className='space-y-6 animate-fade-in'>
				{/* Empty State Cards */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					<div className='bg-white p-6 rounded-2xl border border-slate-100 shadow-sm opacity-75'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-slate-500 font-medium text-sm'>
								{t("dashboard.stats.today_revenue")}
							</h3>
							<div className='p-2 bg-slate-50 rounded-lg'>
								<DollarSign className='w-5 h-5 text-slate-400' />
							</div>
						</div>
						<div className='text-2xl font-bold text-slate-900'>0 ₼</div>
						<div className='text-xs text-slate-400 mt-1'>
							0 {t("dashboard.stats.bookings_today")}
						</div>
					</div>
					{/* ... other empty cards ... */}
					<div className='bg-white p-6 rounded-2xl border border-slate-100 shadow-sm opacity-75'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-slate-500 font-medium text-sm'>
								{t("dashboard.stats.month_revenue")}
							</h3>
							<div className='p-2 bg-slate-50 rounded-lg'>
								<TrendingUp className='w-5 h-5 text-slate-400' />
							</div>
						</div>
						<div className='text-2xl font-bold text-slate-900'>0 ₼</div>
						<div className='text-xs text-slate-400 mt-1'>
							0 {t("dashboard.stats.bookings_month")}
						</div>
					</div>
					<div className='bg-white p-6 rounded-2xl border border-slate-100 shadow-sm opacity-75'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-slate-500 font-medium text-sm'>
								{t("dashboard.stats.total_clients")}
							</h3>
							<div className='p-2 bg-slate-50 rounded-lg'>
								<Users className='w-5 h-5 text-slate-400' />
							</div>
						</div>
						<div className='text-2xl font-bold text-slate-900'>0</div>
						<div className='text-xs text-slate-400 mt-1'>
							{t("dashboard.stats.unique_clients")}
						</div>
					</div>
				</div>

				<div className='text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200'>
					<TrendingUp className='w-12 h-12 text-slate-300 mx-auto mb-3' />
					<h3 className='text-lg font-medium text-slate-900'>
						{t("dashboard.stats.get_started_title") || "Ready for Business?"}
					</h3>
					<p className='text-slate-500 max-w-md mx-auto'>
						{t("dashboard.stats.get_started_desc") ||
							"Your analytics will appear here once you start receiving bookings."}
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className='space-y-6 animate-fade-in'>
			{/* Cards */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				<div className='bg-white p-6 rounded-2xl border border-slate-100 shadow-sm'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-slate-500 font-medium text-sm'>
							{t("dashboard.stats.today_revenue")}
						</h3>
						<div className='p-2 bg-green-50 rounded-lg'>
							<DollarSign className='w-5 h-5 text-green-600' />
						</div>
					</div>
					<div className='text-2xl font-bold text-slate-900'>{stats.today.revenue} ₼</div>
					<div className='text-xs text-slate-400 mt-1'>
						{stats.today.bookings} {t("dashboard.stats.bookings_today")}
					</div>
				</div>

				<div className='bg-white p-6 rounded-2xl border border-slate-100 shadow-sm'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-slate-500 font-medium text-sm'>
							{t("dashboard.stats.month_revenue")}
						</h3>
						<div className='p-2 bg-blue-50 rounded-lg'>
							<TrendingUp className='w-5 h-5 text-blue-600' />
						</div>
					</div>
					<div className='text-2xl font-bold text-slate-900'>{stats.month.revenue} ₼</div>
					<div className='text-xs text-slate-400 mt-1'>
						{stats.month.bookings} {t("dashboard.stats.bookings_month")}
					</div>
				</div>

				<div className='bg-white p-6 rounded-2xl border border-slate-100 shadow-sm'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-slate-500 font-medium text-sm'>
							{t("dashboard.stats.total_clients")}
						</h3>
						<div className='p-2 bg-purple-50 rounded-lg'>
							<Users className='w-5 h-5 text-purple-600' />
						</div>
					</div>
					<div className='text-2xl font-bold text-slate-900'>{stats.totalClients}</div>
					<div className='text-xs text-slate-400 mt-1'>
						{t("dashboard.stats.unique_clients")}
					</div>
				</div>
			</div>

			{/* Chart */}
			<div className='bg-white p-6 rounded-2xl border border-slate-100 shadow-sm'>
				<h3 className='text-lg font-bold text-slate-900 mb-6'>
					{t("dashboard.stats.weekly_overview")}
				</h3>
				<div className='h-80'>
					<ResponsiveContainer width='100%' height='100%'>
						<BarChart data={stats.chart}>
							<CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
							<XAxis
								dataKey='date'
								tickFormatter={(val) => val.split("-").slice(1).join("/")}
								axisLine={false}
								tickLine={false}
								tick={{ fill: "#64748b", fontSize: 12 }}
								dy={10}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fill: "#64748b", fontSize: 12 }}
							/>
							<Tooltip
								cursor={{ fill: "#f8fafc" }}
								contentStyle={{
									borderRadius: "12px",
									border: "none",
									boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
								}}
							/>
							<Bar
								dataKey='revenue'
								fill='#0f172a'
								radius={[4, 4, 0, 0]}
								name={t("dashboard.stats.revenue")}
							/>
							<Bar
								dataKey='bookings'
								fill='#cbd5e1'
								radius={[4, 4, 0, 0]}
								name={t("dashboard.stats.bookings")}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	)
}
