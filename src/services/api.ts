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
		if (response.status === 401 || response.status === 403) {
			// fetchWithAuth already tried to refresh — session is truly gone
			throw new Error(JSON.stringify({ error: "Session expired. Please log in again." }))
		}
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

// Deduplicates concurrent refresh attempts — if 3 requests 401 at once, only 1 refresh call is made
let _refreshPromise: Promise<boolean> | null = null

async function tryRefreshToken(): Promise<boolean> {
	if (!_refreshPromise) {
		_refreshPromise = (async () => {
			const token = useAuthStore.getState().token
			if (!token) return false
			try {
				const res = await fetch(`${API_BASE}/auth/refresh`, {
					method: "POST",
					headers: { Authorization: `Bearer ${token}` }
				})
				if (!res.ok) return false
				const data = await res.json()
				useAuthStore.getState().updateToken(data.token)
				return true
			} catch {
				return false
			}
		})().finally(() => {
			_refreshPromise = null
		})
	}
	return _refreshPromise
}

/**
 * Drop-in fetch wrapper that auto-refreshes the JWT on 401/403.
 * If refresh also fails the user is logged out silently.
 */
export async function fetchWithAuth(
	url: string,
	options: RequestInit = {}
): Promise<Response> {
	const { headers: extraHeaders, ...rest } = options
	const buildHeaders = () => ({
		...getHeaders(),
		...(extraHeaders as Record<string, string> | undefined)
	})
	const response = await fetch(url, { ...rest, headers: buildHeaders() })

	if (response.status === 401 || response.status === 403) {
		const refreshed = await tryRefreshToken()
		if (refreshed) {
			// Retry once with the new token
			return fetch(url, { ...rest, headers: buildHeaders() })
		}
		// Refresh failed — silently log the user out (ProtectedRoute will redirect to /login)
		useAuthStore.getState().logout()
	}

	return response
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
		list: (
			query?: string,
			page?: number,
			limit?: number,
			lat?: number,
			lng?: number,
			radius?: number
		) => {
			const params = new URLSearchParams()
			if (query) params.append("query", query)
			if (page) params.append("page", page.toString())
			if (limit) params.append("limit", limit.toString())
			if (lat) params.append("lat", lat.toString())
			if (lng) params.append("lng", lng.toString())
			if (radius) params.append("radius", radius.toString())

			return fetch(`${API_BASE}/barbers?${params.toString()}`).then((res) =>
				handleResponse<any>(res)
			)
		},
		get: (id: string) =>
			fetch(`${API_BASE}/barbers/${id}`).then((res) => handleResponse<Barber>(res)),

		getReviews: (id: string, page: number = 1, limit: number = 5) =>
			fetch(`${API_BASE}/barbers/${id}/reviews?page=${page}&limit=${limit}`).then((res) =>
				handleResponse<{
					data: Review[]
					meta: { total: number; page: number; limit: number; totalPages: number }
				}>(res)
			),

		addReview: (id: string, data: { rating: number; text?: string }) =>
			fetchWithAuth(`${API_BASE}/barbers/${id}/reviews`, {
				method: "POST",
				body: JSON.stringify(data)
			}).then((res) => handleResponse<Review>(res)),
		getStats: (id: string) =>
			fetchWithAuth(`${API_BASE}/barbers/${id}/stats`).then((res) =>
				handleResponse<any>(res)
			),

		getClients: (id: string) =>
			fetchWithAuth(`${API_BASE}/barbers/${id}/clients`).then((res) =>
				handleResponse<any[]>(res)
			),

		saveClientNote: (
			barberId: string,
			clientId: string,
			data: { notes: string; tags: string[] }
		) =>
			fetchWithAuth(`${API_BASE}/barbers/${barberId}/clients/${clientId}/notes`, {
				method: "POST",
				body: JSON.stringify(data)
			}).then((res) => handleResponse<any>(res)),

		activateTrial: () =>
			fetchWithAuth(`${API_BASE}/barbers/trial`, { method: "POST" }).then((res) =>
				handleResponse<{ success: boolean; message: string }>(res)
			),

		update: (id: string, data: Partial<Barber>) =>
			fetchWithAuth(`${API_BASE}/barbers/${id}`, {
				method: "PUT",
				body: JSON.stringify(data)
			}).then((res) => handleResponse<Barber>(res))
	},

	bookings: {
		create: (
			data: Omit<Booking, "id" | "status" | "createdAt"> & { asGuest?: boolean }
		) =>
			fetchWithAuth(`${API_BASE}/bookings`, {
				method: "POST",
				body: JSON.stringify(data)
			}).then((res) => handleResponse<Booking>(res)),

		listForBarber: (
			barberId: string,
			params?: { date?: string; page?: number; limit?: number; status?: string }
		) => {
			const query = new URLSearchParams()
			if (params?.date) query.set("date", params.date)
			if (params?.page) query.set("page", params.page.toString())
			if (params?.limit) query.set("limit", params.limit.toString())
			if (params?.status) query.set("status", params.status)
			const suffix = query.toString() ? `?${query.toString()}` : ""
			return fetchWithAuth(`${API_BASE}/barbers/${barberId}/bookings${suffix}`).then(
				(res) => handleResponse<any>(res)
			)
		},

		listForClient: (clientId: string, page?: number, limit?: number) => {
			const params = new URLSearchParams()
			if (page) params.append("page", page.toString())
			if (limit) params.append("limit", limit.toString())
			const suffix = params.toString() ? `?${params.toString()}` : ""
			return fetchWithAuth(`${API_BASE}/users/${clientId}/bookings${suffix}`).then(
				(res) => handleResponse<any>(res)
			)
		},

		updateStatus: (id: string, status: Booking["status"], comment?: string) =>
			fetchWithAuth(`${API_BASE}/bookings/${id}`, {
				method: "PATCH",
				body: JSON.stringify({ status, comment })
			}).then((res) => handleResponse<Booking>(res))
	},

	favorites: {
		list: (userId: string) =>
			fetchWithAuth(`${API_BASE}/users/${userId}/favorites`).then((res) =>
				handleResponse<Barber[]>(res)
			),

		add: (userId: string, barberId: string) =>
			fetchWithAuth(`${API_BASE}/users/${userId}/favorites`, {
				method: "POST",
				body: JSON.stringify({ barberId })
			}).then((res) => handleResponse<void>(res)),

		remove: (userId: string, barberId: string) =>
			fetchWithAuth(`${API_BASE}/users/${userId}/favorites/${barberId}`, {
				method: "DELETE"
			}).then((res) => handleResponse<void>(res))
	},

	users: {
		get: (id: string) =>
			fetchWithAuth(`${API_BASE}/users/${id}`).then((res) => handleResponse<User>(res))
	}
}
