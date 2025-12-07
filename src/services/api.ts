import { Barber, Booking, User } from "../types"

const API_BASE = "/api"

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const error = await response.text()
		throw new Error(error || response.statusText)
	}
	return response.json()
}

export const api = {
	auth: {
		login: (email: string) =>
			fetch(`${API_BASE}/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email })
			}).then((res) => handleResponse<{ user: User; token: string }>(res)),

		register: (data: Partial<User>) =>
			fetch(`${API_BASE}/auth/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			}).then((res) => handleResponse<{ user: User; token: string }>(res))
	},

	barbers: {
		list: (query?: string) => {
			const params = new URLSearchParams()
			if (query) params.append("query", query)
			return fetch(`${API_BASE}/barbers?${params.toString()}`).then((res) =>
				handleResponse<Barber[]>(res)
			)
		},
		get: (id: string) =>
			fetch(`${API_BASE}/barbers/${id}`).then((res) => handleResponse<Barber>(res))
	},

	bookings: {
		create: (data: Omit<Booking, "id" | "status" | "createdAt">) =>
			fetch(`${API_BASE}/bookings`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			}).then((res) => handleResponse<Booking>(res)),

		listForBarber: (barberId: string) =>
			fetch(`${API_BASE}/barbers/${barberId}/bookings`).then((res) =>
				handleResponse<Booking[]>(res)
			),

		listForClient: (clientId: string) =>
			fetch(`${API_BASE}/users/${clientId}/bookings`).then((res) =>
				handleResponse<Booking[]>(res)
			),

		updateStatus: (id: string, status: Booking["status"]) =>
			fetch(`${API_BASE}/bookings/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status })
			}).then((res) => handleResponse<Booking>(res))
	},

	favorites: {
		list: (userId: string) =>
			fetch(`${API_BASE}/users/${userId}/favorites`).then((res) =>
				handleResponse<Barber[]>(res)
			),

		add: (userId: string, barberId: string) =>
			fetch(`${API_BASE}/users/${userId}/favorites`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ barberId })
			}).then((res) => handleResponse<void>(res)),

		remove: (userId: string, barberId: string) =>
			fetch(`${API_BASE}/users/${userId}/favorites/${barberId}`, {
				method: "DELETE"
			}).then((res) => handleResponse<void>(res))
	},

	users: {
		get: (id: string) =>
			fetch(`${API_BASE}/users/${id}`).then((res) => handleResponse<User>(res))
	}
}
