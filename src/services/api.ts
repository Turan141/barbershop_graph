import { Barber, Booking, User, Review } from "../types"
import { useAuthStore } from "../store/authStore"
import { Capacitor } from "@capacitor/core"

const getApiBase = () => {
	const override = import.meta.env.VITE_API_URL
	if (override) return override

	// If running in Capacitor (Native Mobile App)
	if (Capacitor.isNativePlatform()) {
		return "https://barbershop-graph-api.vercel.app/api"
	}
	// If running in Browser (Development or Production)
	return import.meta.env.PROD ? "/api" : "http://localhost:3000/api"
}

const API_BASE = getApiBase()

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const error = await response.text()
		console.error("API Error:", error)
		throw new Error(error || response.statusText)
	}
	const contentType = response.headers.get("content-type")
	if (contentType && !contentType.includes("application/json")) {
		const text = await response.text()
		console.error("API Non-JSON Response:", text)
		throw new Error("Received non-JSON response from server")
	}
	return response.json()
}

const getHeaders = () => {
	const token = useAuthStore.getState().token
	return {
		"Content-Type": "application/json",
		...(token ? { Authorization: `Bearer ${token}` } : {})
	}
}

export const api = {
	auth: {
		login: (email: string, password: string) =>
			fetch(`${API_BASE}/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password })
			}).then((res) => handleResponse<{ user: User; token: string }>(res)),

		register: (data: any) =>
			fetch(`${API_BASE}/auth/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			}).then((res) => handleResponse<{ user: User; token: string }>(res))
	},

	barbers: {
		list: (query?: string, page?: number, limit?: number) => {
			const params = new URLSearchParams()
			if (query) params.append("query", query)
			if (page) params.append("page", page.toString())
			if (limit) params.append("limit", limit.toString())
			return fetch(`${API_BASE}/barbers?${params.toString()}`).then((res) =>
				handleResponse<any>(res)
			)
		},
		get: (id: string) =>
			fetch(`${API_BASE}/barbers/${id}`).then((res) => handleResponse<Barber>(res)),

		getReviews: (id: string) =>
			fetch(`${API_BASE}/barbers/${id}/reviews`).then((res) =>
				handleResponse<Review[]>(res)
			),

		addReview: (id: string, data: { rating: number; text?: string }) =>
			fetch(`${API_BASE}/barbers/${id}/reviews`, {
				method: "POST",
				headers: getHeaders(),
				body: JSON.stringify(data)
			}).then((res) => handleResponse<Review>(res)),

		getStats: (id: string) =>
			fetch(`${API_BASE}/barbers/${id}/stats`, {
				headers: getHeaders()
			}).then((res) => handleResponse<any>(res)),

		getClients: (id: string) =>
			fetch(`${API_BASE}/barbers/${id}/clients`, {
				headers: getHeaders()
			}).then((res) => handleResponse<any[]>(res)),

		saveClientNote: (
			barberId: string,
			clientId: string,
			data: { notes: string; tags: string[] }
		) =>
			fetch(`${API_BASE}/barbers/${barberId}/clients/${clientId}/notes`, {
				method: "POST",
				headers: getHeaders(),
				body: JSON.stringify(data)
			}).then((res) => handleResponse<any>(res)),

		update: (id: string, data: Partial<Barber>) =>
			fetch(`${API_BASE}/barbers/${id}`, {
				method: "PUT",
				headers: getHeaders(),
				body: JSON.stringify(data)
			}).then((res) => handleResponse<Barber>(res))
	},

	bookings: {
		create: (data: Omit<Booking, "id" | "status" | "createdAt">) =>
			fetch(`${API_BASE}/bookings`, {
				method: "POST",
				headers: getHeaders(),
				body: JSON.stringify(data)
			}).then((res) => handleResponse<Booking>(res)),

		listForBarber: (barberId: string, params?: { date?: string }) => {
			const query = new URLSearchParams()
			if (params?.date) query.set("date", params.date)
			const suffix = query.toString() ? `?${query.toString()}` : ""
			return fetch(`${API_BASE}/barbers/${barberId}/bookings${suffix}`, {
				headers: getHeaders()
			}).then((res) => handleResponse<Booking[]>(res))
		},

		listForClient: (clientId: string, page?: number, limit?: number) => {
			const params = new URLSearchParams()
			if (page) params.append("page", page.toString())
			if (limit) params.append("limit", limit.toString())
			const suffix = params.toString() ? `?${params.toString()}` : ""
			return fetch(`${API_BASE}/users/${clientId}/bookings${suffix}`, {
				headers: getHeaders()
			}).then((res) => handleResponse<any>(res))
		},

		updateStatus: (id: string, status: Booking["status"], comment?: string) =>
			fetch(`${API_BASE}/bookings/${id}`, {
				method: "PATCH",
				headers: getHeaders(),
				body: JSON.stringify({ status, comment })
			}).then((res) => handleResponse<Booking>(res))
	},

	favorites: {
		list: (userId: string) =>
			fetch(`${API_BASE}/users/${userId}/favorites`, {
				headers: getHeaders()
			}).then((res) => handleResponse<Barber[]>(res)),

		add: (userId: string, barberId: string) =>
			fetch(`${API_BASE}/users/${userId}/favorites`, {
				method: "POST",
				headers: getHeaders(),
				body: JSON.stringify({ barberId })
			}).then((res) => handleResponse<void>(res)),

		remove: (userId: string, barberId: string) =>
			fetch(`${API_BASE}/users/${userId}/favorites/${barberId}`, {
				method: "DELETE",
				headers: getHeaders()
			}).then((res) => handleResponse<void>(res))
	},

	users: {
		get: (id: string) =>
			fetch(`${API_BASE}/users/${id}`, {
				headers: getHeaders()
			}).then((res) => handleResponse<User>(res))
	}
}
